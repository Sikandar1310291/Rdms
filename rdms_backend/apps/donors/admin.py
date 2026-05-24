from django.contrib import admin
from .models import Donor, Donation, DonationAllocation

@admin.register(Donor)
class DonorAdmin(admin.ModelAdmin):
    list_display = ('name', 'donor_type', 'email', 'phone')
    list_filter = ('donor_type',)
    search_fields = ('name', 'email')

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('donor', 'donation_date', 'amount', 'donation_type', 'remaining_balance')
    list_filter = ('donation_type',)

@admin.register(DonationAllocation)
class DonationAllocationAdmin(admin.ModelAdmin):
    list_display = ('donation', 'project', 'allocated_amount', 'allocated_date')
