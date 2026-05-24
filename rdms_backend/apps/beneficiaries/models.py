from django.db import models
from django.conf import settings

class District(models.Model):
    PROVINCE_CHOICES = (
        ('SINDH', 'Sindh'),
        ('BALOCHISTAN', 'Balochistan'),
        ('PUNJAB', 'Punjab'),
        ('KPK', 'KPK'),
    )
    name = models.CharField(max_length=100, unique=True)
    province = models.CharField(max_length=20, choices=PROVINCE_CHOICES)

    def __str__(self):
        return f"{self.name} ({self.get_province_display()})"

class Village(models.Model):
    name = models.CharField(max_length=100)
    district = models.ForeignKey(District, on_delete=models.RESTRICT, related_name='villages')
    gps_coordinates = models.CharField(max_length=100, blank=True, null=True)
    population_estimate = models.IntegerField(default=0)

    class Meta:
        unique_together = ('name', 'district')

    def __str__(self):
        return f"{self.name} - {self.district.name}"

class Household(models.Model):
    household_code = models.CharField(max_length=50, unique=True)
    village = models.ForeignKey(Village, on_delete=models.RESTRICT, related_name='households')
    family_income_pkr = models.DecimalField(max_digits=10, decimal_places=2)
    water_source = models.CharField(max_length=100)
    is_widow_headed = models.BooleanField(default=False)

    def __str__(self):
        return self.household_code

class Beneficiary(models.Model):
    GENDER_CHOICES = (
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    )
    cnic = models.CharField(max_length=15, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    household = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='members')
    is_head_of_household = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.cnic})"

class NeedsAssessment(models.Model):
    NEED_CHOICES = (
        ('WATER', 'Water'),
        ('FOOD', 'Food'),
        ('MEDICAL', 'Medical'),
        ('EDUCATION', 'Education'),
        ('SHELTER', 'Shelter'),
        ('INCOME', 'Income'),
    )
    household = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='assessments')
    assessment_date = models.DateField()
    poverty_score = models.IntegerField()  # Range: 1 to 100
    housing_condition = models.CharField(max_length=100)
    primary_need = models.CharField(max_length=20, choices=NEED_CHOICES)
    assessed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.RESTRICT)
    comments = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Assessment {self.id} for HH: {self.household.household_code}"
