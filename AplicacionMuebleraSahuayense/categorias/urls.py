from django.urls import path 

from categorias.views import CategoryView, CategoryListView, CategoryUpdateView, PublicCategoryListView, eliminar_categoria

urlpatterns=[
    path('registro/', CategoryView.as_view(), name='categoria'),
    path('consulta/', CategoryListView.as_view(), name='categoriasList'),
    path('actualizar/<str:nameCategory>/', CategoryUpdateView.as_view(), name='categoriaUpdate'),
    path('eliminar/<int:id>/', eliminar_categoria, name='eliminar_categoria'),

    path('publicas/', PublicCategoryListView.as_view(), name='categorias_publicas'),
]