from django.shortcuts import render
from rest_framework import viewsets
from .models import Series, StreamingProvider
from .serializers import SeriesSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
import requests
import os
from collections import defaultdict


class SeriesViewSet(viewsets.ModelViewSet):
    queryset = Series.objects.all()
    serializer_class = SeriesSerializer

    @action(detail=False, methods=['get'], url_path='search-tmdb')
    def search_tmdb(self, request):
        query = request.query_params.get('q', '')
        if not query or len(query) < 2:
            return Response([])
        
        TMDB_API_KEY = os.getenv('TMDB_API_KEY') 
        
        if not TMDB_API_KEY:
            return Response({'error': 'TMDB_API_KEY não configurada'}, status=500)
        
        url = 'https://api.themoviedb.org/3/search/tv'
        
        params = {
            'api_key': TMDB_API_KEY,
            'query': query,
            'language': 'pt-BR'
        }
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            
            results = []
            for item in data.get('results', []):
                results.append({
                    'tmdb_id': item['id'],
                    'title': item['name'],
                    'description': item['overview'],
                    'poster_path': item.get('poster_path', '')
                })
            return Response(results)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=True, methods=['post'], url_path='fetch-providers')
    def fetch_providers(self, request, pk=None):
        series = self.get_object()
        tmdb_id = series.tmdb_id

        if not tmdb_id:
            return Response({'error': 'Série não possui TMDB ID'}, status=400)

        TMDB_API_KEY = os.getenv('TMDB_API_KEY')
        if not TMDB_API_KEY:
            return Response({'error': 'TMDB_API_KEY não configurada'}, status=500)

        url = f'https://api.themoviedb.org/3/tv/{tmdb_id}/watch/providers'
        params = {'api_key': TMDB_API_KEY}

        try:
            response = requests.get(url, params=params)
            data = response.json()
        except Exception as e:
            return Response({'error': str(e)}, status=400)

        results = data.get('results', {})
        br_data = results.get('BR', {})

        providers = br_data.get('flatrate', [])

        StreamingProvider.objects.filter(series=series).delete()

        created = []
        for prov in providers:
            provider, _ = StreamingProvider.objects.update_or_create(
                series=series,
                provider_id=prov['provider_id'],
                defaults={
                    'provider_name': prov['provider_name'],
                    'logo_path': prov.get('logo_path', ''),
                    'display_priority': prov.get('display_priority', 0),
                }
            )
            created.append(provider)

        serializer = SeriesSerializer(series)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='recommendations')
    def recommendations(self, request):
        TMDB_API_KEY = os.getenv('TMDB_API_KEY')
        if not TMDB_API_KEY:
            return Response({'error': 'TMDB_API_KEY não configurada'}, status=500)

        # Pega top 5 séries do backlog com nota > 0
        top_series = Series.objects.filter(
            collection_type='backlog', grade__gt=0
        ).order_by('-grade')[:5]

        if not top_series:
            return Response([])

        recomendacoes = defaultdict(lambda: {
            'tmdb_id': None,
            'title': '',
            'overview': '',
            'poster_path': '',
            'vote_average': 0,
            'match_count': 0,
            'source_titles': [],
        })

        for s in top_series:
            if not s.tmdb_id:
                continue

            url = f'https://api.themoviedb.org/3/tv/{s.tmdb_id}/recommendations'
            params = {'api_key': TMDB_API_KEY, 'language': 'pt-BR'}

            try:
                resp = requests.get(url, params=params)
                data = resp.json()
            except Exception:
                continue

            for item in data.get('results', []):
                rid = item['id']
                rec = recomendacoes[rid]
                rec['tmdb_id'] = rid
                rec['title'] = item.get('name', '')
                rec['overview'] = item.get('overview', '')
                rec['poster_path'] = item.get('poster_path', '') or ''
                rec['vote_average'] = item.get('vote_average', 0)
                rec['match_count'] += 1
                rec['source_titles'].append(s.title)

        # Remove recomendações que já estão no backlog ou watchLater
        existing_ids = set(
            Series.objects.filter(
                tmdb_id__in=[r['tmdb_id'] for r in recomendacoes.values()]
            ).values_list('tmdb_id', flat=True)
        )

        results = [
            r for r in recomendacoes.values()
            if r['tmdb_id'] not in existing_ids
        ]

        # Ordena: mais match_count primeiro, depois maior vote_average
        results.sort(key=lambda r: (-r['match_count'], -r['vote_average']))

        return Response(results[:12])