#views 
from django.shortcuts import get_object_or_404, render
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from categorias.models import Categorias
from categorias.serializers import CategoriaSerializer

class CategoryView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # <---- para recibir archivos

    def post(self, request):
        serializer = CategoriaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "La categoria se guardo con exito"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        category = Categorias.objects.all()
        serializer = CategoriaSerializer(category, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CategoryUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, nameCategory):
        category = get_object_or_404(Categorias, nameCategory=nameCategory)
        serializer = CategoriaSerializer(category, data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Categoria actualizada correctamente"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from categorias.models import Categorias

@api_view(['POST'])  # También puede ser DELETE, pero POST es más cómodo con fetch
@permission_classes([IsAuthenticated])
def eliminar_categoria(request, id):
    try:
        categoria = Categorias.objects.get(id=id)

        if categoria.productos.exists():
            return Response({'warning': 'No puedes eliminar esta categoría porque tiene productos asociados.'}, status=400)

        categoria.delete()
        return Response({'success': True}, status=200)

    except Categorias.DoesNotExist:
        return Response({'error': 'Categoría no encontrada'}, status=404)



# categorias/views.py

from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from categorias.models import Categorias
from categorias.serializers import CategoriaSerializer

class PublicCategoryListView(ListAPIView):
    queryset = Categorias.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]


