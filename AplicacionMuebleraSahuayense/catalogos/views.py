from django.http import HttpResponse, HttpResponseRedirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from .models import CatalogoURL
from .serializers import CatalogoURLSerializer


# Vista para redireccionar directamente al catálogo
def descargar_catalogo(request):
    try:
        catalogo = CatalogoURL.objects.latest('uploaded_at')
        return HttpResponseRedirect(catalogo.url_pdf)
    except CatalogoURL.DoesNotExist:
        return HttpResponse("No hay catálogo disponible.", status=404)


# Vista API: GET público, POST autenticado
class CatalogoURLAPIView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        try:
            catalogo = CatalogoURL.objects.latest('uploaded_at')
            serializer = CatalogoURLSerializer(catalogo)
            return Response(serializer.data)
        except CatalogoURL.DoesNotExist:
            return Response({'error': 'No hay catálogo disponible'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        try:
            url = request.data.get('url_pdf')
            if not url:
                return Response({'error': 'No se proporcionó una URL.'}, status=status.HTTP_400_BAD_REQUEST)

            # Elimina el catálogo anterior (si hay) y guarda el nuevo
            CatalogoURL.objects.all().delete()
            catalogo = CatalogoURL.objects.create(url_pdf=url)

            return Response({
                'mensaje': 'Catálogo guardado correctamente.',
                'url_pdf': catalogo.url_pdf
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
