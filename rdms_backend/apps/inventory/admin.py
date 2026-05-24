from django.contrib import admin
from .models import Inventory, InventoryTransaction, AidDistribution

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('item_name', 'item_type', 'quantity_available', 'unit', 'reorder_level')
    list_filter = ('item_type',)
    search_fields = ('item_name',)

@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ('inventory', 'transaction_type', 'quantity', 'transaction_date', 'user')
    list_filter = ('transaction_type',)

@admin.register(AidDistribution)
class AidDistributionAdmin(admin.ModelAdmin):
    list_display = ('household', 'inventory', 'project', 'quantity_distributed', 'distribution_date')
    list_filter = ('project',)
    search_fields = ('household__household_code',)
