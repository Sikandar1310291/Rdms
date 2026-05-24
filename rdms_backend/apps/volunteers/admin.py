from django.contrib import admin
from .models import Volunteer, Skill, VolunteerSkill, VolunteerAssignment

@admin.register(Volunteer)
class VolunteerAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'cnic', 'email', 'status')
    list_filter = ('status',)
    search_fields = ('cnic', 'first_name', 'last_name', 'email')

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(VolunteerSkill)
class VolunteerSkillAdmin(admin.ModelAdmin):
    list_display = ('volunteer', 'skill')

@admin.register(VolunteerAssignment)
class VolunteerAssignmentAdmin(admin.ModelAdmin):
    list_display = ('volunteer', 'project', 'village', 'start_date', 'end_date')
    list_filter = ('project',)
