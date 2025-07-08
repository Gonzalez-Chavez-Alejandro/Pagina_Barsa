from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from autentication.serializers import RegisterSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "El usuario se creo correctamente",
                "username": user.username  # <-- Devuelve el username aquí
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()

class ListUsersView(APIView):
    permission_classes = [IsAdminUser]  # Solo admins pueden acceder

    def get(self, request):
        users = User.objects.filter(stateUser=True) # <- Aqui filtra los usuarios por los que estan activos
        data = []
        for u in users:
            data.append({
                'id': u.id,
                'username': u.username,
                'last_name': u.last_name,
                'email': u.email,
                'phoneUser': u.phoneUser,
                'ubicacionUser': u.ubicacionUser,
                'is_superuser': u.is_superuser,

                # agrega campos extra que uses, como phoneUser, etc
            })
        return Response(data, status=status.HTTP_200_OK)



# autentication/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import ProtectedError
from .models import CustomUser
from .serializers import UserListSerializer
from .permissions import IsAdminOrIsSelf  # importa el permiso personalizado

from django.db.models import ProtectedError
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import CustomUser
from .serializers import UserListSerializer
from .permissions import IsAdminOrIsSelf

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrIsSelf]

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()

            # Verificar si el usuario tiene encargos relacionados
            if hasattr(instance, 'encargos') and instance.encargos.exists():
                return Response(
                    {"error": "No se puede eliminar este usuario porque tiene pedidos asociados."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            instance.delete()
            return Response(
                {"detail": "El usuario ha sido eliminado permanentemente."},
                status=status.HTTP_204_NO_CONTENT
            )
        except ProtectedError:
            return Response(
                {"error": "No se puede eliminar este usuario porque tiene relaciones protegidas."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


# autentication/views.py

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer




# autentication/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import SuperUserCreateSerializer

class CrearSuperUserAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        serializer = SuperUserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Superusuario creado correctamente"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# autentication/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

class VerificarPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        password = request.data.get('password')
        user = request.user

        if not password:
            return Response({"error": "La contraseña es requerida."}, status=400)

        if not user.check_password(password):
            return Response({"valid": False}, status=200)

        return Response({"valid": True}, status=200)








# autentication/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import CustomUser
from .serializers import ActualizarUbicacionSerializer

class ActualizarUbicacionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        serializer = ActualizarUbicacionSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
