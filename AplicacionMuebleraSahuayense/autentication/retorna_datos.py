# retorna_datos.py
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "username": user.username,
            "last_name":user.last_name,
            "email": user.email,
            "phoneUser": user.phoneUser,
            "stateUser": user.stateUser,
            "ageUser": user.ageUser,  # <--- agregar este campo
            "ubicacionUser": user.ubicacionUser,

            "is_superuser": user.is_superuser,

        }
        return Response(data)


