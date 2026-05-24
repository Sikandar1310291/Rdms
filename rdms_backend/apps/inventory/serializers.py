from rest_framework import serializers
from django.db import transaction
from apps.beneficiaries.serializers import SanitizedCharField
from .models import Inventory, InventoryTransaction, AidDistribution

class InventorySerializer(serializers.ModelSerializer):
    item_name = SanitizedCharField()
    unit = SanitizedCharField()

    class Meta:
        model = Inventory
        fields = '__all__'

class InventoryTransactionSerializer(serializers.ModelSerializer):
    comments = SanitizedCharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = InventoryTransaction
        fields = '__all__'

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Transaction quantity must be greater than zero.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        inventory = validated_data['inventory']
        tx_type = validated_data['transaction_type']
        qty = validated_data['quantity']

        if tx_type == 'INFLOW':
            inventory.quantity_available += qty
        elif tx_type == 'OUTFLOW':
            if inventory.quantity_available < qty:
                raise serializers.ValidationError(
                    f"Insufficient stock. Available: {inventory.quantity_available} {inventory.unit}"
                )
            inventory.quantity_available -= qty

        inventory.save()
        return InventoryTransaction.objects.create(**validated_data)

class AidDistributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AidDistribution
        fields = '__all__'

    def validate(self, data):
        inventory = data['inventory']
        qty = data['quantity_distributed']

        if qty <= 0:
            raise serializers.ValidationError("Quantity distributed must be greater than zero.")

        if inventory.quantity_available < qty:
            raise serializers.ValidationError(
                f"Insufficient stock. Available: {inventory.quantity_available} {inventory.unit}"
            )
        return data

    @transaction.atomic
    def create(self, validated_data):
        inventory = validated_data['inventory']
        qty = validated_data['quantity_distributed']
        project = validated_data['project']
        user = validated_data['logged_by_user']
        household = validated_data['household']

        # 1. Deduct stock
        inventory.quantity_available -= qty
        inventory.save()

        # 2. Write outflow transaction log
        InventoryTransaction.objects.create(
            inventory=inventory,
            transaction_type='OUTFLOW',
            quantity=qty,
            project=project,
            user=user,
            comments=f"Aid distributed to household {household.household_code}"
        )

        # 3. Create distribution record
        return AidDistribution.objects.create(**validated_data)
