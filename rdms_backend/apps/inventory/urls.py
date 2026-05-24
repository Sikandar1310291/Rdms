from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryViewSet, InventoryTransactionViewSet, AidDistributionViewSet

router = DefaultRouter()
router.register(r'stock', InventoryViewSet)
router.register(r'transactions', InventoryTransactionViewSet)
router.register(r'distributions', AidDistributionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
