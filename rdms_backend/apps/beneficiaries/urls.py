from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DistrictViewSet, VillageViewSet, HouseholdViewSet,
    BeneficiaryViewSet, NeedsAssessmentViewSet
)

router = DefaultRouter()
router.register(r'districts', DistrictViewSet)
router.register(r'villages', VillageViewSet)
router.register(r'households', HouseholdViewSet)
router.register(r'beneficiaries', BeneficiaryViewSet)
router.register(r'assessments', NeedsAssessmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
