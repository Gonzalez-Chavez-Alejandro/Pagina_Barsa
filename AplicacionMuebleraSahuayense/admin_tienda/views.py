from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.shortcuts import render
import cloudinary
import cloudinary.utils
import os
import time
import json

from django.views.decorators.csrf import csrf_exempt
#from flask import app, render_template



cloudinary.config(
    cloud_name='dacrpsl5p',
    api_key='793629269656468',
    api_secret='McJk0x5SWIouN2WWdO77WM8mPIA'
)


DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'



# Ruta base para las carpetas (si las necesitas en el sistema de archivos)
BASE_DIR_CARPETAS = os.path.join(os.getcwd(), 'carpetas')  # Ajusta si es otra ruta

# Asegurar que la carpeta base exista
os.makedirs(BASE_DIR_CARPETAS, exist_ok=True)


ARCHIVO = 'carpetas.txt'

# ========================
# Generación de firma Cloudinary
# ========================
def generate_signature(request):
    public_id = request.GET.get('public_id')
    if not public_id:
        return JsonResponse({'error': 'public_id es necesario'}, status=400)

    timestamp = str(int(time.time()))
    params = {
        'timestamp': timestamp,
        'upload_preset': 'formulario',
        'public_id': public_id
    }

    signature = cloudinary.utils.api_sign_request(params, cloudinary.config().api_secret)

    return JsonResponse({
        'signature': signature,
        'timestamp': timestamp
    })






def administrador(request):
    return render(request, 'admin_tienda/Administrador.html') 

def home(request):
    return render(request, 'admin_tienda/Home.html')  # Ruta correcta de la plantilla

def login(request):
    return render(request, 'admin_tienda/Login.html')

def nosotros(request):
    return render(request, 'admin_tienda/Nosotros.html')

def registro(request):
    return render(request, 'admin_tienda/Registro.html')

def productos(request):
    return render(request, 'admin_tienda/Productos.html')


def productos_vista(request):
    
    return render(request, 'admin_tienda/Producto-vista-solo.html')


def catalogo(request):
    return render(request, 'admin_tienda/Catalogo.html')


def configuracion_usuario(request):
    return render(request, 'admin_tienda/configuracion_usuario.html')


def contacto(request):
    return render(request, 'admin_tienda/contacto.html')

#def administrador_agregar_producto(request):
#    return render(request, 'admin_tienda/Administrador-agregar-producto.html')


#def administrador_editar_producto(request):
#    return render(request, 'admin_tienda/Administrador-Editar-producto.html')



