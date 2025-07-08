from django.urls import path, include
from django.contrib import admin
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('autentication.urls')),
    path('', include('admin_tienda.urls')),
    path('categorias/', include('categorias.urls')),
    path('productos/', include('productos.urls')),
    path('encargos/', include('encargos.urls')),
    path('api/footer/', include('footer.urls')),
    path('catalogos/', include('catalogos.urls')),
    path('password_reset/', include('password_reset.urls')),


]
