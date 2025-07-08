#urls/foother
from django.urls import path
from .views import FooterAPIView

urlpatterns = [
    path('', FooterAPIView.as_view(), name='footer-api'),
]
