from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DonorViewSet, DonationViewSet, DonationAllocationViewSet, DonorCreateView

router = DefaultRouter()
router.register(r'donors', DonorViewSet)
router.register(r'donations', DonationViewSet)
router.register(r'allocations', DonationAllocationViewSet)

urlpatterns = [
    path('add/', DonorCreateView.as_view()),
    path('', include(router.urls)),
]
