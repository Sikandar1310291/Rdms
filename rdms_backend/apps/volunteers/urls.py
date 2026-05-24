from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VolunteerViewSet, SkillViewSet, VolunteerAssignmentViewSet

router = DefaultRouter()
router.register(r'volunteers', VolunteerViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'assignments', VolunteerAssignmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
