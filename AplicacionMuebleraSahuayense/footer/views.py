#serializer/views
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import FooterData
from .serializers import FooterDataSerializer

class FooterAPIView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        footer = FooterData.objects.first()
        if footer:
            serializer = FooterDataSerializer(footer)
            return Response(serializer.data)
        return Response({"detail": "Sin datos"}, status=404)

    def post(self, request):
        if FooterData.objects.exists():
            return Response(
                {"detail": "Ya existe una instancia de FooterData. Usa PUT para actualizar."},
                status=400
            )
        serializer = FooterDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def put(self, request):
        footer = FooterData.objects.first()
        if not footer:
            serializer = FooterDataSerializer(data=request.data)
        else:
            serializer = FooterDataSerializer(footer, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request):
        footer = FooterData.objects.first()
        if not footer:
            return Response({"detail": "No hay datos para eliminar."}, status=404)
        footer.delete()
        return Response({"detail": "Datos del footer eliminados correctamente."}, status=204)
