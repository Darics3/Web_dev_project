from rest_framework.permissions import BasePermission


def get_user_role(user):
    if not user or not user.is_authenticated:
        return None
    profile = getattr(user, 'profile', None)
    return getattr(profile, 'role', None)


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) == 'admin'


class IsAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) in ('admin', 'manager')
