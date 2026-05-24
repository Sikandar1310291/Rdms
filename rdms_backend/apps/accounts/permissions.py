from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Grants permission strictly to Super Admins.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'

class IsNGOManager(permissions.BasePermission):
    """
    Grants access to NGO Managers (and Admin).
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'NGO_MANAGER']

class IsFieldCoordinator(permissions.BasePermission):
    """
    Grants access to Field Coordinators, Managers, and Admins.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'NGO_MANAGER', 'FIELD_COORDINATOR']

class IsDonorUser(permissions.BasePermission):
    """
    Grants read-only or specific safe-method views to Donor users.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated and request.user.role in ['ADMIN', 'NGO_MANAGER', 'DONOR']
        return False
