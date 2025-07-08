#serializers.py 
from rest_framework import serializers
from categorias.models import Categorias

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorias
        fields = ['id','nameCategory', 'descriptionCategory', 'imagenCategory']
        extra_kwargs = {
            'imagenCategory': {'required': False}  # Hace que el campo sea opcional en updates
        }
        
    