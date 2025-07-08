#url producto
from django.urls import path
from productos.views import  PublicProductListView, administrador_agregar_producto, cambiar_estado_producto, cambiar_estado_todos_productos, eliminar_producto, vista_agregar_producto
from productos.views import ProductosListView, administrador_editar_producto

urlpatterns=[
    path('Listar/', ProductosListView.as_view(), name='productos'),
    path('editar-producto/<int:id>/', administrador_editar_producto, name='editar_producto'),
    path('eliminar-producto/<int:id>/', eliminar_producto, name='eliminar_producto'),
    path('administrador_agregar_producto/', administrador_agregar_producto, name='administrador_agregar_producto'),  # HTML
    path('api/vista_agregar_producto/', vista_agregar_producto, name='vista_agregar_producto'),     # API

    path('publicos/', PublicProductListView.as_view(), name='productos-publicos'),
    path('cambiar-estado/<int:id>/', cambiar_estado_producto, name='cambiar_estado_producto'),
    path('cambiar-estado-todos/', cambiar_estado_todos_productos, name='cambiar_estado_todos_productos'),

]