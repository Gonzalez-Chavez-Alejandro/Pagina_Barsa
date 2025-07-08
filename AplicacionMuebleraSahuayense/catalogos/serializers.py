#serializers/catalogo
from rest_framework import serializers
from .models import CatalogoURL

class CatalogoURLSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogoURL
        fields = ['id', 'url_pdf', 'uploaded_at']
