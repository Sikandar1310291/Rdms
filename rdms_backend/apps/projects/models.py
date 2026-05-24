from django.db import models

class Project(models.Model):
    STATUS_CHOICES = (
        ('PLANNED', 'Planned'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('SUSPENDED', 'Suspended'),
    )
    name = models.CharField(max_length=150, unique=True)
    budget_pkr = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    spent_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNED')
    villages = models.ManyToManyField('beneficiaries.Village', related_name='projects')

    def __str__(self):
        return self.name
