from rest_framework import permissions


class IsAdminUserRole(permissions.BasePermission):
    """Allow only ADMIN users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class IsNGOManagerOrCoordinator(permissions.BasePermission):
    """Allow ADMIN, NGO_MANAGER, and FIELD_COORDINATOR for advanced operations"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'NGO_MANAGER', 'FIELD_COORDINATOR']


class IsFieldCoordinator(permissions.BasePermission):
    """Allow ADMIN, NGO_MANAGER, FIELD_COORDINATOR"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'NGO_MANAGER', 'FIELD_COORDINATOR']


class IsDonorUser(permissions.BasePermission):
    """Read‑only access for donor role (and admins/managers)"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated and request.user.role in ['ADMIN', 'NGO_MANAGER', 'DONOR']
        return False


class IsAdminOrManagerOrReadDonor(permissions.BasePermission):
    """Admin/Manager full access, Donor read and add"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.role in ['ADMIN', 'NGO_MANAGER']:
            return True
        if request.user.role == 'DONOR':
            if request.method in permissions.SAFE_METHODS or request.method == 'POST':
                return True
        return False

class IsDonorCreate(permissions.BasePermission):
    """Allow donors to CREATE new donor entries (POST)"""
    def has_permission(self, request, view):
        if request.method == 'POST':
            return request.user.is_authenticated and request.user.role == 'DONOR'
        return False


class IsAdvancedUser(permissions.BasePermission):
    """Allow ADMIN, NGO_MANAGER, FIELD_COORDINATOR for advanced features"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'NGO_MANAGER', 'FIELD_COORDINATOR']
