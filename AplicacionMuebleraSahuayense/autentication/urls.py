# autentication/urls.py

from django.urls import path
from .views import ActualizarUbicacionView, CrearSuperUserAPIView, CustomTokenObtainPairView, RegisterView, ListUsersView, UserDetailView
from rest_framework_simplejwt.views import TokenRefreshView
from autentication.retorna_datos import UserInfoView
from rest_framework_simplejwt.views import TokenObtainPairView
urlpatterns = [
    path('register/', RegisterView.as_view(), name='registerUser'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),  # <-- aquí usas tu view
    path('token/refresh/', TokenRefreshView.as_view(), name='tokenRefresh'),
    path('user-info/', UserInfoView.as_view(), name='user-info'),
    path('users/', ListUsersView.as_view(), name='list-users'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('crear-superuser/', CrearSuperUserAPIView.as_view(), name='crear-superuser'),
    
]
from .views import VerificarPasswordView

urlpatterns += [
    path('verificar-password/', VerificarPasswordView.as_view(), name='verificar-password'),
    path('actualizar-ubicacion/', ActualizarUbicacionView.as_view()),
     path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
]
