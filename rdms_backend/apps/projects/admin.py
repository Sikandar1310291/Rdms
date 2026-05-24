from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'budget_pkr', 'spent_amount', 'start_date', 'end_date')
    list_filter = ('status',)
    search_fields = ('name',)
    filter_horizontal = ('villages',)
