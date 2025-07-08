# encargos/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Encargo, ProductoEncargado
from .serializer import EncargoSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_encargos_usuario(request):
    usuario = request.user
    encargos = Encargo.objects.filter(usuario=usuario).order_by('-fecha')
    serializer = EncargoSerializer(encargos, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_encargo(request):
    usuario = request.user
    productos = request.data.get('productos', [])
    total = 0

    ubicacion_entrega = request.data.get('ubicacion_entrega') or usuario.ubicacionUser or ""

    print(f"Ubicación de entrega asignada: '{ubicacion_entrega}'")

    advertencias = []

    encargo = Encargo.objects.create(
        usuario=usuario, 
        total=0,
        ubicacion_entrega=ubicacion_entrega
    )

    for p in productos:
        producto_id = p.get('producto_id')
        cantidad = p.get('cantidad')
        precio_unitario = p.get('precio_unitario')

        if producto_id is None or cantidad is None or precio_unitario is None:
            continue

        cantidad = int(cantidad)
        precio_unitario = float(precio_unitario)

        if precio_unitario == 0:
            advertencias.append(
                f"Producto con ID {producto_id} precio no definido. Póngase en contacto para cotización."
            )

        ProductoEncargado.objects.create(
            encargo=encargo,
            producto_id=producto_id,
            cantidad=cantidad,
            precio_unitario=precio_unitario
        )

        total += cantidad * precio_unitario

    encargo.total = total
    encargo.save()

    serializer = EncargoSerializer(encargo)

    return Response({
        "encargo": serializer.data,
        "advertencias": advertencias
    }, status=201)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from encargos.models import Encargo
from django.shortcuts import get_object_or_404

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def actualizar_ubicacion_encargo(request, encargo_id):
    encargo = get_object_or_404(Encargo, id=encargo_id, usuario=request.user)
    ubicacion = request.data.get('ubicacion_entrega')
    if ubicacion is None:
        return Response({"detail": "ubicacion_entrega es requerida."}, status=400)
    encargo.ubicacion_entrega = ubicacion
    encargo.save()
    return Response({"detail": "Ubicación actualizada correctamente."})



@api_view(['PATCH'])  # o POST si prefieres
@permission_classes([IsAuthenticated])
def agregar_producto_a_encargo(request, encargo_id):
    try:
        encargo = Encargo.objects.get(id=encargo_id, usuario=request.user)
    except Encargo.DoesNotExist:
        return Response({"detail": "Encargo no encontrado"}, status=404)

    producto_id = request.data.get('producto_id')
    cantidad = int(request.data.get('cantidad', 1))
    precio_unitario = float(request.data.get('precio_unitario', 0))

    if not producto_id or cantidad <= 0 or precio_unitario < 0:
     return Response({"detail": "Datos inválidos"}, status=400)


    # Buscar si ya hay producto en el encargo
    producto_encargado, creado = ProductoEncargado.objects.get_or_create(
        encargo=encargo,
        producto_id=producto_id,
        defaults={'cantidad': cantidad, 'precio_unitario': precio_unitario}
    )

    if not creado:
        producto_encargado.cantidad += cantidad
        producto_encargado.save()

    # Recalcular total
    total = sum(p.cantidad * p.precio_unitario for p in encargo.productos_encargados.all())
    encargo.total = total
    encargo.save()

    serializer = EncargoSerializer(encargo)
    return Response(serializer.data)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Encargo, ProductoEncargado
from .serializer import EncargoSerializer

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def actualizar_cantidad_producto_en_encargo(request, encargo_id):
    try:
        encargo = Encargo.objects.get(id=encargo_id, usuario=request.user)
    except Encargo.DoesNotExist:
        return Response({"detail": "Encargo no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    producto_id = request.data.get('producto_id')
    nueva_cantidad = request.data.get('cantidad')

    if producto_id is None or nueva_cantidad is None:
        return Response({"detail": "producto_id y cantidad son requeridos"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        nueva_cantidad = int(nueva_cantidad)
        if nueva_cantidad < 0:
            raise ValueError
    except ValueError:
        return Response({"detail": "Cantidad inválida"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        producto_encargado = ProductoEncargado.objects.get(encargo=encargo, producto_id=producto_id)
    except ProductoEncargado.DoesNotExist:
        return Response({"detail": "Producto no encontrado en el encargo"}, status=status.HTTP_404_NOT_FOUND)

    if nueva_cantidad == 0:
        # Eliminar el producto del encargo
        producto_encargado.delete()
    else:
        # Actualizar cantidad
        producto_encargado.cantidad = nueva_cantidad
        producto_encargado.save()

    # Recalcular total del encargo
    total = sum(p.cantidad * p.precio_unitario for p in encargo.productos_encargados.all())
    encargo.total = total
    encargo.save()

    serializer = EncargoSerializer(encargo)
    return Response(serializer.data)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Encargo
from .utils import enviar_correo_a_empresa
from .utils_user import enviar_correo_info_footer  # importa la función del nuevo utils_user.py


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def procesar_pedido(request, encargo_id):
    try:
        encargo = Encargo.objects.get(id=encargo_id, usuario=request.user)
    except Encargo.DoesNotExist:
        return Response({"detail": "Encargo no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    # Validar si el encargo tiene productos
    if not encargo.productos_encargados.exists():
        return Response({"detail": "El encargo está vacío"}, status=status.HTTP_400_BAD_REQUEST)

    # Cambiar estado del encargo para marcarlo como procesado
    encargo.estado = 'procesado'  # Asegúrate que el campo y valor existan en tu modelo
    encargo.save()

    # Enviar correo a la empresa con los detalles del pedido
    enviar_correo_a_empresa(request.user, encargo)

    # Enviar correo al usuario con info del footer/contacto
    enviar_correo_info_footer(request.user.email, request.user.last_name)

    return Response({"detail": "Pedido procesado exitosamente"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_carrito_actual(request):
    usuario = request.user
    try:
        carrito = Encargo.objects.filter(usuario=usuario, estado="carrito").prefetch_related("productos_encargados__producto").first()
        if carrito:
            serializer = EncargoSerializer(carrito)
            return Response(serializer.data)
        else:
            return Response({"detalle": "No hay carrito activo."}, status=204)
    except Exception as e:
        return Response({"detalle": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_carrito(request):
    usuario = request.user

    # Verificar si ya existe un carrito activo
    carrito_existente = Encargo.objects.filter(usuario=usuario, estado="carrito").first()
    if carrito_existente:
        serializer = EncargoSerializer(carrito_existente)
        return Response(serializer.data, status=200)

    # Crear nuevo carrito con estado "carrito"
    nuevo_carrito = Encargo.objects.create(usuario=usuario, estado="carrito", total=0)
    serializer = EncargoSerializer(nuevo_carrito)
    return Response(serializer.data, status=201)





from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView

class ListarTodosLosPedidos(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        estado = request.query_params.get('estado')

        if estado:
            # Si hay un estado, filtramos por ese estado (excepto 'carrito' explícitamente)
            if estado == "carrito":
                return Response([])  # o puedes devolver un 400 si quieres evitarlo
            encargos = Encargo.objects.filter(estado=estado).exclude(estado='carrito').order_by('-fecha')
        else:
            # Si no hay estado, traemos todos menos 'carrito'
            encargos = Encargo.objects.exclude(estado='carrito').order_by('-fecha')

        serializer = EncargoSerializer(encargos, many=True)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def mover_a_papelera(request, encargo_id):
    try:
        encargo = Encargo.objects.get(id=encargo_id)
        encargo.estado = 'papelera'
        encargo.save()
        return Response({"mensaje": "Encargo movido a papelera"})
    except Encargo.DoesNotExist:
        return Response({"error": "Encargo no encontrado"}, status=404)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def eliminar_papelera(request):
    encargos_en_papelera = Encargo.objects.filter(estado='papelera')
    total = encargos_en_papelera.count()
    encargos_en_papelera.delete()
    return Response({"mensaje": f"Se eliminaron {total} pedidos en papelera."})

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def eliminar_encargo(request, encargo_id):
    try:
        encargo = Encargo.objects.get(id=encargo_id)
        encargo.delete()
        return Response({"mensaje": "Encargo eliminado correctamente"})
    except Encargo.DoesNotExist:
        return Response({"error": "Encargo no encontrado"}, status=404)


from rest_framework import status

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cambiar_estado_encargo(request, encargo_id):
    try:
        encargo = Encargo.objects.get(id=encargo_id)
    except Encargo.DoesNotExist:
        return Response({"detail": "Encargo no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    nuevo_estado = request.data.get('estado')
    estados_validos = [ 'carrito', 'procesado', 'enviado', 'entregado', 'cancelado', 'papelera','pendiente']  # ajusta según tus estados
#quite carrito
    if nuevo_estado not in estados_validos:
        return Response({"detail": f"Estado inválido. Los válidos son: {estados_validos}"}, status=status.HTTP_400_BAD_REQUEST)

    encargo.estado = nuevo_estado
    encargo.save()

    serializer = EncargoSerializer(encargo)
    return Response(serializer.data, status=status.HTTP_200_OK)



