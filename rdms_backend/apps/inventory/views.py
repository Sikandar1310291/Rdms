from rest_framework import viewsets, permissions
from .models import Inventory, InventoryTransaction, AidDistribution
from .serializers import InventorySerializer, InventoryTransactionSerializer, AidDistributionSerializer
from apps.accounts.permissions import IsFieldCoordinator

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all().order_by('item_name')
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated, IsFieldCoordinator]

class InventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = InventoryTransaction.objects.all().select_related('inventory', 'project', 'user')
    serializer_class = InventoryTransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsFieldCoordinator]

class AidDistributionViewSet(viewsets.ModelViewSet):
    queryset = AidDistribution.objects.all().select_related(
        'household', 'inventory', 'project', 'logged_by_user', 'distributed_by_volunteer'
    )
    serializer_class = AidDistributionSerializer
    permission_classes = [permissions.IsAuthenticated, IsFieldCoordinator]
