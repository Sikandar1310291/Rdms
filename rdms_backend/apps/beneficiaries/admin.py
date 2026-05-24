from django.contrib import admin
from .models import District, Village, Household, Beneficiary, NeedsAssessment

@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ('name', 'province')
    list_filter = ('province',)
    search_fields = ('name',)

@admin.register(Village)
class VillageAdmin(admin.ModelAdmin):
    list_display = ('name', 'district', 'population_estimate')
    list_filter = ('district__province',)
    search_fields = ('name',)

@admin.register(Household)
class HouseholdAdmin(admin.ModelAdmin):
    list_display = ('household_code', 'village', 'family_income_pkr', 'is_widow_headed')
    list_filter = ('is_widow_headed', 'village__district')
    search_fields = ('household_code',)

@admin.register(Beneficiary)
class BeneficiaryAdmin(admin.ModelAdmin):
    list_display = ('cnic', 'first_name', 'last_name', 'gender', 'household', 'is_head_of_household')
    list_filter = ('gender', 'is_head_of_household')
    search_fields = ('cnic', 'first_name', 'last_name')

@admin.register(NeedsAssessment)
class NeedsAssessmentAdmin(admin.ModelAdmin):
    list_display = ('household', 'assessment_date', 'poverty_score', 'primary_need', 'assessed_by')
    list_filter = ('primary_need',)
