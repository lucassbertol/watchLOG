from rest_framework import serializers
from .models import Series, StreamingProvider


class StreamingProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = StreamingProvider
        fields = ['provider_id', 'provider_name', 'logo_path', 'display_priority']


class SeriesSerializer(serializers.ModelSerializer):
    providers = StreamingProviderSerializer(many=True, read_only=True)

    class Meta:
        model = Series
        fields = '__all__'

    def to_internal_value(self, data):
        if 'tmdb_rating' in data and data['tmdb_rating'] not in (None, ''):
            try:
                data = data.copy()
                data['tmdb_rating'] = round(float(data['tmdb_rating']), 1)
            except (ValueError, TypeError):
                pass
        return super().to_internal_value(data)