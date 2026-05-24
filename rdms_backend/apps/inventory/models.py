from django.db import models
from django.conf import settings
from apps.projects.models import Project
from apps.beneficiaries.models import Household
from apps.volunteers.models import Volunteer

class Inventory(models.Model):
    TYPE_CHOICES = (
        ('FOOD', 'Food'),
        ('WATER_EQUIPMENT', 'Water Equipment'),
        ('MEDICAL_SUPPLIES', 'Medical Supplies'),
        ('SHELTER_EQUIPMENT', 'Shelter Equipment'),
        ('EDUCATION_MATERIAL', 'Education Material'),
        ('OTHER', 'Other'),
    )
    item_name = models.CharField(max_length=150, unique=True)
    item_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    quantity_available = models.IntegerField(default=0)
    unit = models.CharField(max_length=20)
    reorder_level = models.IntegerField(default=5)

    def __str__(self):
        return f"{self.item_name} ({self.quantity_available} {self.unit})"

class InventoryTransaction(models.Model):
    TYPE_CHOICES = (
        ('INFLOW', 'Inflow'),
        ('OUTFLOW', 'Outflow'),
    )
    inventory = models.ForeignKey(Inventory, on_delete=models.RESTRICT, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    quantity = models.IntegerField()
    transaction_date = models.DateTimeField(auto_now_add=True)
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT)
    comments = models.CharField(max_length=255, blank=True, null=True)

class AidDistribution(models.Model):
    household = models.ForeignKey(Household, on_delete=models.RESTRICT, related_name='distributions')
    inventory = models.ForeignKey(Inventory, on_delete=models.RESTRICT, related_name='distributions')
    project = models.ForeignKey(Project, on_delete=models.RESTRICT, related_name='distributions')
    quantity_distributed = models.IntegerField()
    distribution_date = models.DateField()
    distributed_by_volunteer = models.ForeignKey(
        Volunteer, on_delete=models.SET_NULL, blank=True, null=True
    )
    logged_by_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT)
