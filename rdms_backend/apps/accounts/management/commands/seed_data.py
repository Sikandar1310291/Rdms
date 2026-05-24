"""
Seed management command — creates an admin superuser + essential demo data.
Run: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial admin user and demo data.'

    def handle(self, *args, **options):
        self.stdout.write('--- Seeding RDMS Database ---')

        # ── Create Users ──────────────────────────────────────────────────────
        users = [
            dict(username='admin',       password='admin123',       role='ADMIN',             email='admin@usf.org.pk',      first_name='Super',     last_name='Admin'),
            dict(username='manager',     password='manager123',     role='NGO_MANAGER',       email='manager@usf.org.pk',    first_name='Khalid',    last_name='Mehmood'),
            dict(username='coordinator', password='coord123',       role='FIELD_COORDINATOR', email='coord@usf.org.pk',      first_name='Zara',      last_name='Fatima'),
            dict(username='donor_view',  password='donor123',       role='DONOR',             email='donor@hbl.org.pk',      first_name='HBL',       last_name='Foundation'),
        ]
        for u in users:
            if not User.objects.filter(username=u['username']).exists():
                User.objects.create_superuser(**u) if u['role'] == 'ADMIN' else User.objects.create_user(**u)
                self.stdout.write(self.style.SUCCESS(f"  * Created user: {u['username']}"))
            else:
                self.stdout.write(f"  - User already exists: {u['username']}")

        # ── Geography ─────────────────────────────────────────────────────────
        from apps.beneficiaries.models import District, Village, Household, Beneficiary, NeedsAssessment
        from apps.projects.models import Project
        from apps.donors.models import Donor, Donation, DonationAllocation
        from apps.volunteers.models import Volunteer, Skill, VolunteerSkill, VolunteerAssignment
        from apps.inventory.models import Inventory, InventoryTransaction, AidDistribution
        import datetime

        lasbela, _  = District.objects.get_or_create(name='Lasbela',    defaults={'province': 'BALOCHISTAN'})
        thatta, _   = District.objects.get_or_create(name='Thatta',     defaults={'province': 'SINDH'})
        khuzdar, _  = District.objects.get_or_create(name='Khuzdar',    defaults={'province': 'BALOCHISTAN'})

        winder, _   = Village.objects.get_or_create(name='Winder',      defaults={'district': lasbela, 'population_estimate': 3500})
        liari, _    = Village.objects.get_or_create(name='Liari',       defaults={'district': lasbela, 'population_estimate': 2100})
        jati, _     = Village.objects.get_or_create(name='Jati',        defaults={'district': thatta,  'population_estimate': 4200})
        wadh, _     = Village.objects.get_or_create(name='Wadh',        defaults={'district': khuzdar, 'population_estimate': 1800})

        self.stdout.write(self.style.SUCCESS('  * Seeded geography'))

        # ── Households & Beneficiaries ────────────────────────────────────────
        coord = User.objects.get(username='coordinator')

        hh_data = [
            ('HH-LSE-001', winder, 15000, 'Hand Pump', True,  '42301-1234567-1', 'Farzana',   'Khatoon',  'FEMALE', '1978-04-10'),
            ('HH-LSE-002', liari,  22000, 'Borehole',  False, '54401-7654321-2', 'Muhammad',  'Ibrahim',  'MALE',   '1985-06-20'),
            ('HH-THA-001', jati,   12000, 'River',     True,  '43201-2345678-3', 'Sakina',    'Bibi',     'FEMALE', '1972-11-05'),
            ('HH-KHZ-001', wadh,   18000, 'Open Well', False, '43101-3456789-4', 'Ahmed',     'Baloch',   'MALE',   '1990-03-15'),
        ]
        for code, village, income, water, widow, cnic, fn, ln, gender, dob in hh_data:
            hh, created = Household.objects.get_or_create(
                household_code=code,
                defaults={'village': village, 'family_income_pkr': income, 'water_source': water, 'is_widow_headed': widow}
            )
            if not Beneficiary.objects.filter(cnic=cnic).exists():
                Beneficiary.objects.create(
                    cnic=cnic, first_name=fn, last_name=ln, gender=gender,
                    date_of_birth=dob, household=hh, is_head_of_household=True
                )
            if not hh.assessments.exists():
                NeedsAssessment.objects.create(
                    household=hh, assessment_date=datetime.date(2026, 1, 15),
                    poverty_score=72, housing_condition='Kutcha', primary_need='FOOD',
                    assessed_by=coord
                )

        self.stdout.write(self.style.SUCCESS('  * Seeded households & beneficiaries'))

        # ── Projects ──────────────────────────────────────────────────────────
        proj1, _ = Project.objects.get_or_create(
            name='Lasbela Clean Water Drive',
            defaults={'budget_pkr': 0, 'start_date': '2026-01-01', 'status': 'ACTIVE'}
        )
        proj1.villages.set([winder, liari])

        proj2, _ = Project.objects.get_or_create(
            name='Thatta Food Security Program',
            defaults={'budget_pkr': 0, 'start_date': '2026-02-01', 'status': 'ACTIVE'}
        )
        proj2.villages.set([jati])

        self.stdout.write(self.style.SUCCESS('  * Seeded projects'))

        # ── Donors & Donations ────────────────────────────────────────────────
        donor1, _ = Donor.objects.get_or_create(
            email='hbl@hbl.org.pk',
            defaults={'name': 'HBL Foundation', 'donor_type': 'CORPORATE', 'phone': '021-32456789'}
        )
        donor2, _ = Donor.objects.get_or_create(
            email='undp@undp.org',
            defaults={'name': 'UNDP Pakistan', 'donor_type': 'INTERNATIONAL', 'phone': '051-2044000'}
        )

        if not Donation.objects.filter(donor=donor1).exists():
            dn1 = Donation.objects.create(
                donor=donor1, donation_date='2026-01-10', amount=500000,
                donation_type='CASH', remaining_balance=300000
            )
            DonationAllocation.objects.create(donation=dn1, project=proj1, allocated_amount=200000, allocated_date='2026-01-12')
            proj1.budget_pkr += 200000; proj1.save()

        if not Donation.objects.filter(donor=donor2).exists():
            dn2 = Donation.objects.create(
                donor=donor2, donation_date='2026-02-05', amount=750000,
                donation_type='CASH', remaining_balance=450000
            )
            DonationAllocation.objects.create(donation=dn2, project=proj2, allocated_amount=300000, allocated_date='2026-02-07')
            proj2.budget_pkr += 300000; proj2.save()

        self.stdout.write(self.style.SUCCESS('  * Seeded donors & donations'))

        # ── Volunteers ────────────────────────────────────────────────────────
        med_skill,  _ = Skill.objects.get_or_create(name='Medical Aid',     defaults={'description': 'First aid and basic healthcare'})
        dist_skill, _ = Skill.objects.get_or_create(name='Aid Distribution',defaults={'description': 'Field distribution coordination'})

        vol1, _ = Volunteer.objects.get_or_create(
            cnic='54401-1111111-1',
            defaults={'first_name': 'Ali', 'last_name': 'Hassan', 'contact_number': '0312-1234567', 'email': 'ali.hassan@usf.org.pk', 'status': 'AVAILABLE'}
        )
        VolunteerSkill.objects.get_or_create(volunteer=vol1, skill=dist_skill)
        VolunteerAssignment.objects.get_or_create(
            volunteer=vol1, project=proj1, village=winder,
            defaults={'start_date': '2026-01-15', 'role_description': 'Distribution Lead'}
        )

        self.stdout.write(self.style.SUCCESS('  * Seeded volunteers'))

        # ── Inventory ─────────────────────────────────────────────────────────
        manager = User.objects.get(username='manager')
        hh_obj  = Household.objects.get(household_code='HH-LSE-001')

        flour, _ = Inventory.objects.get_or_create(
            item_name='Wheat Flour 10kg',
            defaults={'item_type': 'FOOD', 'quantity_available': 200, 'unit': 'Bag', 'reorder_level': 20}
        )
        water_filter, _ = Inventory.objects.get_or_create(
            item_name='Portable Water Filter',
            defaults={'item_type': 'WATER_EQUIPMENT', 'quantity_available': 50, 'unit': 'Unit', 'reorder_level': 5}
        )

        if not InventoryTransaction.objects.filter(inventory=flour).exists():
            InventoryTransaction.objects.create(
                inventory=flour, transaction_type='INFLOW', quantity=200,
                project=proj1, user=manager, comments='Initial stock purchase'
            )

        if not AidDistribution.objects.filter(household=hh_obj).exists():
            AidDistribution.objects.create(
                household=hh_obj, inventory=flour, project=proj1,
                quantity_distributed=5, distribution_date='2026-03-01',
                distributed_by_volunteer=vol1, logged_by_user=manager
            )
            flour.quantity_available -= 5
            flour.save()

        self.stdout.write(self.style.SUCCESS('  * Seeded inventory & distributions'))
        self.stdout.write(self.style.SUCCESS('\n* RDMS database seeding complete!\n'))
        self.stdout.write('  Login credentials:')
        self.stdout.write('  admin       / admin123')
        self.stdout.write('  manager     / manager123')
        self.stdout.write('  coordinator / coord123')
        self.stdout.write('  donor_view  / donor123')
