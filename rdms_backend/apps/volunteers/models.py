from django.db import models
from apps.projects.models import Project
from apps.beneficiaries.models import Village

class Volunteer(models.Model):
    STATUS_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('ON_ASSIGNMENT', 'On Assignment'),
        ('INACTIVE', 'Inactive'),
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    cnic = models.CharField(max_length=15, unique=True)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

class VolunteerSkill(models.Model):
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='skills_list')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('volunteer', 'skill')

class VolunteerAssignment(models.Model):
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='assignments')
    project = models.ForeignKey(Project, on_delete=models.RESTRICT, related_name='volunteer_assignments')
    village = models.ForeignKey(Village, on_delete=models.RESTRICT)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    role_description = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        unique_together = ('volunteer', 'project', 'village')
