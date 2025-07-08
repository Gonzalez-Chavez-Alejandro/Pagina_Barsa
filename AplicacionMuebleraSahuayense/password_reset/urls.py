from django.urls import include, path


from password_reset.views import SendResetCodeView, VerifyResetCodeView

from password_reset.views import RestablecerPasswordView

urlpatterns = [
    path('send-code/', SendResetCodeView.as_view(), name='send-reset-code'),
    path('verify-code/', VerifyResetCodeView.as_view(), name='verify-reset-code'),
    path('restablecer-password/', RestablecerPasswordView.as_view(), name='restablecer-password'),
]

