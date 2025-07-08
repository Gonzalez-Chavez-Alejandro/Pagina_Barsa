# productos/serializers.py
from rest_framework import serializers
from productos.models import Productos
from categorias.models import Categorias

class ProductoSerializer(serializers.ModelSerializer):
    PrecioOferta = serializers.SerializerMethodField()
    categorias_nombres = serializers.SerializerMethodField()

    class Meta:
        model = Productos
        fields = [
            'id',
            'categoryID',  # sigue mandando los IDs
            'categorias_nombres',  # nuevo campo para mostrar en frontend
            'nameFurniture',
            'descriptionFurniture',
            'priceFurniture', #Precio original
            'porcentajeDescuento',#Porcentaje descuento
            'stateFurniture',#Precio con descuento
            'userID',
            'imageFurniture',
            'PrecioOferta',# <- El precio de descuento no es este?
        ]

    def get_PrecioOferta(self, obj):
        precio = obj.priceFurniture or 0
        descuento = obj.porcentajeDescuento or 0
        try:
            return round(precio * (1 - descuento / 100), 2)
        except Exception:
            return 0


    def get_categorias_nombres(self, obj):
        return [cat.nameCategory for cat in obj.categoryID.all()]

