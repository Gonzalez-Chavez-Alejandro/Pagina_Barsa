# encargos/serializers.py
from rest_framework import serializers
from .models import Encargo, ProductoEncargado
from productos.serializer import ProductoSerializer

class ProductoEncargadoSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer()  
    imagen = serializers.SerializerMethodField()  

    class Meta:
        model = ProductoEncargado
        fields = ['producto', 'cantidad', 'precio_unitario', 'imagen']

    def get_imagen(self, obj):
        imagenes = obj.producto.imageFurniture.split(",") if obj.producto.imageFurniture else []
        return imagenes[0].strip() if imagenes else 'https://via.placeholder.com/100'


class EncargoSerializer(serializers.ModelSerializer):
    productos_encargados = ProductoEncargadoSerializer(many=True, read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    usuario_correo = serializers.CharField(source='usuario.email', read_only=True)
    usuario_telefono = serializers.CharField(source='usuario.phoneUser', read_only=True)  
    ubicacion_entrega = serializers.CharField(read_only=True)

    class Meta:
        model = Encargo
        fields = [
            'id', 'usuario', 'usuario_nombre', 'usuario_correo', 'usuario_telefono',
            'fecha', 'total', 'estado','ubicacion_entrega', 'productos_encargados'
        ]


