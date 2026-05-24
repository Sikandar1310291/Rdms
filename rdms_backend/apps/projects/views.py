from rest_framework import viewsets, permissions
from .models import Project
from .serializers import ProjectSerializer
from apps.accounts.permissions import IsFieldCoordinator

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().prefetch_related('villages')
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsFieldCoordinator]
