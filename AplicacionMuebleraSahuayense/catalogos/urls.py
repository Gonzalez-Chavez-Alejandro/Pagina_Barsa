from django.urls import path
from .views import descargar_catalogo, CatalogoURLAPIView

urlpatterns = [
    path('descargar/', descargar_catalogo, name='descargar-catalogo'),
    path('catalogo-api/', CatalogoURLAPIView.as_view(), name='catalogo-api'),
]
