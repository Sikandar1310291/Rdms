from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Super Admin'),
        ('NGO_MANAGER', 'NGO Manager'),
        ('FIELD_COORDINATOR', 'Field Coordinator'),
        ('DONOR', 'Donor/Sponsor'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='FIELD_COORDINATOR')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
