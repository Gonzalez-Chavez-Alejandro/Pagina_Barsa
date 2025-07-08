from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import PasswordResetCode
from .serializers import SendCodeSerializer, VerifyCodeSerializer
from django.utils import timezone

User = get_user_model()

class SendResetCodeView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = SendCodeSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"detail": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

            # Generar código aleatorio numérico (6 dígitos)
            code = get_random_string(length=6, allowed_chars='0123456789')

            # Guardar código en DB
            PasswordResetCode.objects.create(user=user, code=code)

            # Enviar código por email (puedes mejorar el mensaje y asunto)
            send_mail(
                'Código de recuperación de contraseña',
                f'Tu código es: {code}\nEl código expira en 1 hora.',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )

            return Response({"detail": "Código enviado al correo"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyResetCodeView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = VerifyCodeSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            new_password = serializer.validated_data['new_password']

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"detail": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

            # Buscar código válido y sin usar
            reset_code_qs = PasswordResetCode.objects.filter(user=user, code=code, is_used=False).order_by('-created_at')

            if not reset_code_qs.exists():
                return Response({"detail": "Código inválido"}, status=status.HTTP_400_BAD_REQUEST)

            reset_code = reset_code_qs.first()

            if reset_code.is_expired():
                return Response({"detail": "Código expirado"}, status=status.HTTP_400_BAD_REQUEST)

            # Actualizar contraseña
            user.set_password(new_password)
            user.save()

            # Marcar código como usado
            reset_code.is_used = True
            reset_code.save()

            return Response({"detail": "Contraseña actualizada correctamente"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class RestablecerPasswordView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get("email")
        new_password = request.data.get("new_password")

        if not email or not new_password:
            return Response({"error": "Datos incompletos"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.save()

        return Response({"detail": "Contraseña actualizada correctamente"}, status=status.HTTP_200_OK)
