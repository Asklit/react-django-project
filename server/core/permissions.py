from rest_framework import permissions
from core.models import Admins

class IsAdminOrSelf(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if Admins.objects.filter(id_admin=request.user.id_user).exists():
            return True
        return obj.id_user == request.user.id_user