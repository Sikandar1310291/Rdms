from rest_framework import viewsets, permissions, generics
from .models import Donor, Donation, DonationAllocation
from .serializers import DonorSerializer, DonationSerializer, DonationAllocationSerializer
from apps.common.permissions import IsNGOManagerOrCoordinator, IsDonorCreate, IsAdminOrManagerOrReadDonor

class DonorViewSet(viewsets.ModelViewSet):
    queryset = Donor.objects.all().order_by('name')
    serializer_class = DonorSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagerOrReadDonor]

class DonorCreateView(generics.CreateAPIView):
    queryset = Donor.objects.all()
    serializer_class = DonorSerializer
    permission_classes = [permissions.IsAuthenticated, IsDonorCreate]

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all().select_related('donor')
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated, IsNGOManagerOrCoordinator]

    def perform_create(self, serializer):
        # Set initial remaining balance to full amount
        amount = serializer.validated_data['amount']
        serializer.save(remaining_balance=amount)

class DonationAllocationViewSet(viewsets.ModelViewSet):
    queryset = DonationAllocation.objects.all().select_related('donation', 'project')
    serializer_class = DonationAllocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsNGOManagerOrCoordinator]
