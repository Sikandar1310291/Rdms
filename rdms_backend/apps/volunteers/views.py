from rest_framework import viewsets, permissions
from .models import Volunteer, Skill, VolunteerSkill, VolunteerAssignment
from .serializers import VolunteerSerializer, SkillSerializer, VolunteerAssignmentSerializer
from apps.accounts.permissions import IsFieldCoordinator

class VolunteerViewSet(viewsets.ModelViewSet):
    queryset = Volunteer.objects.all().order_by('last_name')
    serializer_class = VolunteerSerializer
    permission_classes = [permissions.IsAuthenticated, IsFieldCoordinator]

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all().order_by('name')
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated, IsFieldCoordinator]

class VolunteerAssignmentViewSet(viewsets.ModelViewSet):
    queryset = VolunteerAssignment.objects.all().select_related('volunteer', 'project', 'village')
    serializer_class = VolunteerAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsFieldCoordinator]
