# encargos/urls.py
from django.urls import path
from encargos.views import ListarTodosLosPedidos, actualizar_cantidad_producto_en_encargo, actualizar_ubicacion_encargo, agregar_producto_a_encargo, cambiar_estado_encargo, crear_carrito, crear_encargo, eliminar_encargo, eliminar_papelera, listar_encargos_usuario, mover_a_papelera, obtener_carrito_actual, procesar_pedido

urlpatterns = [
    path('mis-encargos/', listar_encargos_usuario, name='mis-encargos'),
    path('crear/', crear_encargo, name='crear-encargo'),
    path('agregar/<int:encargo_id>/', agregar_producto_a_encargo, name='agregar-producto-a-encargo'),
    path('actualizar-cantidad/<int:encargo_id>/', actualizar_cantidad_producto_en_encargo, name='actualizar-cantidad-producto'),
    path('procesar-pedido/<int:encargo_id>/', procesar_pedido, name='procesar-pedido'),
    path('crear-carrito/', crear_carrito, name='crear_carrito'),
    path('obtener-carrito/', obtener_carrito_actual, name='obtener_carrito'),


     # 🔽 nuevas rutas para admin
    path('todos/', ListarTodosLosPedidos.as_view()),
    path('mover-a-papelera/<int:encargo_id>/', mover_a_papelera),
    path('papelera/eliminar/', eliminar_papelera),
    path('eliminar/<int:encargo_id>/', eliminar_encargo),
    path('actualizar-ubicacion/<int:encargo_id>/', actualizar_ubicacion_encargo, name='actualizar-ubicacion-encargo'),

    path('<int:encargo_id>/cambiar-estado/', cambiar_estado_encargo, name='cambiar-estado-encargo'),
]
