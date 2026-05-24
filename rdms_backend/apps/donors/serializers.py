from rest_framework import serializers
from django.db import transaction
from .models import Donor, Donation, DonationAllocation
from apps.beneficiaries.serializers import SanitizedCharField

class DonorSerializer(serializers.ModelSerializer):
    name = SanitizedCharField()
    phone = SanitizedCharField(required=False, allow_blank=True, allow_null=True)
    address = SanitizedCharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Donor
        fields = '__all__'

class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.name', read_only=True)
    item_description = SanitizedCharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Donation
        fields = '__all__'

class DonationAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationAllocation
        fields = '__all__'

    def validate(self, data):
        donation = data['donation']
        allocated_amount = data['allocated_amount']

        if allocated_amount <= 0:
            raise serializers.ValidationError("Allocated amount must be positive.")

        if donation.remaining_balance < allocated_amount:
            raise serializers.ValidationError(
                f"Insufficient donation balance. Available: {donation.remaining_balance} PKR"
            )
        return data

    @transaction.atomic
    def create(self, validated_data):
        donation = validated_data['donation']
        project = validated_data['project']
        amount = validated_data['allocated_amount']

        # 1. Deduct donation remaining balance
        donation.remaining_balance -= amount
        donation.save()

        # 2. Increment project budget
        project.budget_pkr += amount
        project.save()

        # 3. Create allocation
        return DonationAllocation.objects.create(**validated_data)
