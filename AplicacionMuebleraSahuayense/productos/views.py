#views productos
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from productos.models import Productos
from productos.serializer import ProductoSerializer

class ProductosListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        productos = Productos.objects.all()  # no hay relaciones a prefetch
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



from django.shortcuts import render, get_object_or_404, redirect
from productos.models import Productos
from categorias.models import Categorias
from django.contrib import messages
from cloudinary.uploader import upload
import json

def administrador_editar_producto(request, id):
    producto = get_object_or_404(Productos, id=id)
    categorias = Categorias.objects.all()

    if request.method == 'POST':
        producto.nameFurniture = request.POST.get('nameFurniture', '')
        producto.descriptionFurniture = request.POST.get('descriptionFurniture', '')
        producto.priceFurniture = request.POST.get('priceFurniture', 0)
        producto.porcentajeDescuento = request.POST.get('porcentajeDescuento', 0)
        producto.stateFurniture = request.POST.get('stateFurniture') == 'on'

        # Obtener lista actual de imágenes
        imagenes_actuales = producto.imageFurniture.split(",") if producto.imageFurniture else []

        # Filtrar imágenes eliminadas
        imagenes_a_eliminar = request.POST.getlist('eliminar_imagenes[]')
        imagenes_actuales = [img for img in imagenes_actuales if img not in imagenes_a_eliminar]

        # Si se subieron nuevas imágenes, agregarlas
        imagenes_subidas = request.FILES.getlist('imageFurniture')
        print("Archivos subidos:", imagenes_subidas)
        for nueva_imagen in imagenes_subidas:
            resultado = upload(nueva_imagen)
            nueva_url = resultado.get('secure_url')
            imagenes_actuales.append(nueva_url)

        # Guardar la nueva lista de imágenes como string separado por comas
        producto.imageFurniture = ",".join(imagenes_actuales)

        producto.save()
        producto.categoryID.set(request.POST.getlist('categoryID[]'))

        messages.success(request, "Producto actualizado correctamente.")
        return redirect('/administrador/?abrir=section-productos')

    return render(request, 'admin_tienda/Administrador-Editar-producto.html', {
        'producto': producto,
        'categorias': categorias
    })


from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from productos.models import Productos

@api_view(['POST'])  # o DELETE
@permission_classes([IsAuthenticated])
def eliminar_producto(request, id):
    try:
        producto = Productos.objects.get(id=id)
        producto.delete()  # Esto elimina el producto y automáticamente limpia la tabla intermedia
        return Response({'success': True})
    except Productos.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=404)



# productos/api_views.py



from django.shortcuts import render
from categorias.models import Categorias


def administrador_agregar_producto(request):
    categorias = Categorias.objects.all()
    return render(request, 'admin_tienda/Administrador-agregar-producto.html', {
        'categorias': categorias
    })



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from productos.models import Productos
from categorias.models import Categorias
from cloudinary.uploader import upload

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vista_agregar_producto(request):
    data = request.data
    files = request.FILES.getlist('imageFurniture')

    errors = {}

    nameFurniture = data.get('nameFurniture', '').strip()
    descriptionFurniture = data.get('descriptionFurniture', '').strip()
    priceFurniture = data.get('priceFurniture', '0').strip()
    porcentajeDescuento = data.get('porcentajeDescuento', '0').strip()
    stateFurniture = data.get('stateFurniture', 'off')

    # CORRECCIÓN IMPORTANTE: no existe getlist en request.data, usamos getlist de request.POST
    # Pero aquí, como usamos DRF, request.data es QueryDict si multipart, entonces:
    if hasattr(data, 'getlist'):
        category_ids = data.getlist('categoryID')  # Nota: en tu HTML el name es "categoryID" sin []
    else:
        category_ids = data.get('categoryID', [])
        if isinstance(category_ids, str):
            category_ids = [category_ids]

    # Validaciones
    if not nameFurniture:
        errors['nameFurniture'] = "El nombre es obligatorio."
    if not descriptionFurniture:
        errors['descriptionFurniture'] = "La descripción es obligatoria."
    try:
        priceFurniture_float = float(priceFurniture)
        if priceFurniture_float < 0:
            errors['priceFurniture'] = "El precio debe ser positivo."
    except ValueError:
        errors['priceFurniture'] = "El precio debe ser un número válido."
    try:
        porcentajeDescuento_int = int(porcentajeDescuento)
        if not (0 <= porcentajeDescuento_int <= 100):
            errors['porcentajeDescuento'] = "Debe estar entre 0 y 100."
    except ValueError:
        errors['porcentajeDescuento'] = "Debe ser un número entero válido."
    if not category_ids:
        errors['categoryID'] = "Debe seleccionar al menos una categoría."
    if not files:
        errors['imageFurniture'] = "Debe subir al menos una imagen."

    if errors:
        return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

    urls_imagenes = []
    for img in files:
        result = upload(img,folder='product/')
        url = result.get('secure_url')
        if url:
            urls_imagenes.append(url)

    producto = Productos.objects.create(
        nameFurniture=nameFurniture,
        descriptionFurniture=descriptionFurniture,
        priceFurniture=priceFurniture_float,
        porcentajeDescuento=porcentajeDescuento_int,
        stateFurniture=(stateFurniture == 'on'),
        userID=request.user,
        imageFurniture=",".join(urls_imagenes),
    )
    producto.categoryID.set(category_ids)

    return Response({'mensaje': 'Producto creado exitosamentes.'}, status=status.HTTP_201_CREATED)













from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from productos.models import Productos
from productos.serializer import ProductoSerializer

class PublicProductListView(ListAPIView):
    queryset = Productos.objects.filter(stateFurniture=True)
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]  # Pública




from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Productos

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cambiar_estado_producto(request, id):
    try:
        producto = Productos.objects.get(id=id)
        nuevo_estado = request.data.get("stateFurniture")
        if nuevo_estado is not None:
            # request.data viene como string, convertir a bool
            if isinstance(nuevo_estado, str):
                nuevo_estado = nuevo_estado.lower() in ['true', '1', 'on']
            producto.stateFurniture = nuevo_estado
            producto.save()
            return Response({"message": "Estado actualizado correctamente"})
        else:
            return Response({"error": "Falta el campo 'stateFurniture'"}, status=status.HTTP_400_BAD_REQUEST)
    except Productos.DoesNotExist:
        return Response({"error": "Producto no encontrado"}, status=status.HTTP_404_NOT_FOUND)





@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cambiar_estado_todos_productos(request):
    nuevo_estado = request.data.get("stateFurniture")
    if nuevo_estado is None:
        return Response({"error": "Falta el campo 'stateFurniture'"}, status=400)
    
    if isinstance(nuevo_estado, str):
        nuevo_estado = nuevo_estado.lower() in ['true', '1', 'on']
    
    # Actualizar todos los productos de ese usuario o todos en general (ajusta según lógica)
    Productos.objects.all().update(stateFurniture=nuevo_estado)
    
    return Response({"message": f"Todos los productos han sido {'activados' if nuevo_estado else 'desactivados'}."})
