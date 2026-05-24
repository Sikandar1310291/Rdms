from django.db import models
from apps.projects.models import Project

class Donor(models.Model):
    DONOR_TYPE_CHOICES = (
        ('INDIVIDUAL', 'Individual'),
        ('CORPORATE', 'Corporate'),
        ('NGO_PARTNER', 'NGO Partner'),
        ('INTERNATIONAL', 'International'),
    )
    name = models.CharField(max_length=150)
    donor_type = models.CharField(max_length=20, choices=DONOR_TYPE_CHOICES)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Donation(models.Model):
    TYPE_CHOICES = (
        ('CASH', 'Cash'),
        ('IN_KIND', 'In-Kind'),
    )
    donor = models.ForeignKey(Donor, on_delete=models.RESTRICT, related_name='donations')
    donation_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    donation_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    item_description = models.CharField(max_length=255, blank=True, null=True)
    remaining_balance = models.DecimalField(max_digits=15, decimal_places=2)

    def __str__(self):
        return f"{self.donation_type} - {self.amount} PKR from {self.donor.name}"

class DonationAllocation(models.Model):
    donation = models.ForeignKey(Donation, on_delete=models.RESTRICT, related_name='allocations')
    project = models.ForeignKey(Project, on_delete=models.RESTRICT, related_name='allocations')
    allocated_amount = models.DecimalField(max_digits=15, decimal_places=2)
    allocated_date = models.DateField()

    class Meta:
        unique_together = ('donation', 'project')
