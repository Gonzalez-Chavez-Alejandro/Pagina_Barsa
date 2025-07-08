# autentication/permissions.py
from rest_framework import permissions

class IsAdminOrIsSelf(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        # Permitir a admins
        if request.user.is_staff or request.user.is_superuser:
            return True
        # Permitir a usuario acceder/modificar solo su propio objeto
        return obj == request.user
