from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import District, Village, Household, Beneficiary, NeedsAssessment
from .serializers import (
    DistrictSerializer, VillageSerializer, HouseholdSerializer,
    BeneficiarySerializer, NeedsAssessmentSerializer
)
from apps.accounts.permissions import IsFieldCoordinator

class DistrictViewSet(viewsets.ModelViewSet):
    queryset = District.objects.all().order_by('name')
    serializer_class = DistrictSerializer
    permission_classes = [permissions.IsAuthenticated, IsFieldCoordinator]

class VillageViewSet(viewsets.ModelViewSet):
    queryset = Village.objects.all().select_related('district').order_by('name')
    serializer_class = VillageSerializer
    permission_classes = [permissions.IsAuthenticated, IsFieldCoordinator]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['district']

class HouseholdViewSet(viewsets.ModelViewSet):
    queryset = Household.objects.all().select_related('village__district')
    serializer_class = HouseholdSerializer
    permission_classes = [permissions.IsAuthenticated, IsFieldCoordinator]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['village', 'is_widow_headed']

class BeneficiaryViewSet(viewsets.ModelViewSet):
    queryset = Beneficiary.objects.all().select_related('household')
    serializer_class = BeneficiarySerializer
    permission_classes = [permissions.IsAuthenticated, IsFieldCoordinator]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['cnic', 'first_name', 'last_name']
    filterset_fields = ['household', 'gender']

class NeedsAssessmentViewSet(viewsets.ModelViewSet):
    queryset = NeedsAssessment.objects.all().select_related('household', 'assessed_by')
    serializer_class = NeedsAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsFieldCoordinator]
