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