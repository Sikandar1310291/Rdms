from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from apps.accounts.permissions import IsNGOManager


class BaseReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNGOManager]
    query = ""

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute(self.query)
            columns = [col[0] for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return Response(results)


class DonorImpactReportView(BaseReportView):
    """Total donations & allocations grouped by donor."""
    query = """
        SELECT
            d.id AS donor_id,
            d.name AS donor_name,
            d.donor_type,
            COALESCE(SUM(dn.amount), 0) AS total_donated_pkr,
            COALESCE(SUM(dn.remaining_balance), 0) AS unallocated_balance_pkr,
            COALESCE(SUM(da.allocated_amount), 0) AS total_allocated_pkr,
            COUNT(DISTINCT da.project_id) AS projects_funded_count
        FROM donors_donor d
        LEFT JOIN donors_donation dn ON dn.donor_id = d.id
        LEFT JOIN donors_donationallocation da ON da.donation_id = dn.id
        GROUP BY d.id, d.name, d.donor_type
        ORDER BY total_donated_pkr DESC
    """


class DonationAllocationReportView(BaseReportView):
    """Traces each donation from donor to project."""
    query = """
        SELECT
            dr.name AS donor_name,
            dn.donation_date,
            dn.amount AS donation_amount_pkr,
            p.name AS project_name,
            da.allocated_amount AS allocated_amount_pkr,
            da.allocated_date,
            p.spent_amount AS project_spent_amount
        FROM donors_donor dr
        INNER JOIN donors_donation dn ON dn.donor_id = dr.id
        INNER JOIN donors_donationallocation da ON da.donation_id = dn.id
        INNER JOIN projects_project p ON da.project_id = p.id
        ORDER BY dn.donation_date DESC
    """


class BeneficiaryAidHistoryReportView(BaseReportView):
    """Aid distribution audit log per household."""
    query = """
        SELECT
            h.household_code,
            v.name AS village_name,
            b.first_name AS head_first_name,
            b.last_name AS head_last_name,
            inv.item_name,
            ad.quantity_distributed,
            inv.unit,
            ad.distribution_date,
            p.name AS project_name
        FROM beneficiaries_household h
        INNER JOIN beneficiaries_beneficiary b
            ON b.household_id = h.id AND b.is_head_of_household = TRUE
        INNER JOIN beneficiaries_village v ON h.village_id = v.id
        INNER JOIN inventory_aiddistribution ad ON ad.household_id = h.id
        INNER JOIN inventory_inventory inv ON ad.inventory_id = inv.id
        INNER JOIN projects_project p ON ad.project_id = p.id
        ORDER BY ad.distribution_date DESC
    """


class VillagePovertyProfileReportView(BaseReportView):
    """Aggregated poverty scores and income by village."""
    query = """
        SELECT
            d.name AS district_name,
            d.province,
            v.name AS village_name,
            COUNT(DISTINCT h.id) AS total_households,
            COUNT(DISTINCT b.id) AS total_beneficiaries,
            ROUND(AVG(h.family_income_pkr), 2) AS avg_monthly_income_pkr,
            ROUND(AVG(na.poverty_score), 2) AS avg_poverty_score
        FROM beneficiaries_district d
        INNER JOIN beneficiaries_village v ON v.district_id = d.id
        LEFT JOIN beneficiaries_household h ON h.village_id = v.id
        LEFT JOIN beneficiaries_beneficiary b ON b.household_id = h.id
        LEFT JOIN beneficiaries_needsassessment na ON na.household_id = h.id
        GROUP BY d.id, d.name, d.province, v.id, v.name
        ORDER BY avg_poverty_score DESC
    """


class WidowsReliefReportView(BaseReportView):
    """Widow-headed households in Lasbela who received aid."""
    query = """
        SELECT
            h.household_code,
            v.name AS village_name,
            b.first_name AS head_first_name,
            b.last_name AS head_last_name,
            b.cnic AS head_cnic,
            inv.item_name,
            ad.quantity_distributed,
            ad.distribution_date,
            p.name AS project_name
        FROM beneficiaries_household h
        INNER JOIN beneficiaries_beneficiary b
            ON b.household_id = h.id AND b.is_head_of_household = TRUE
        INNER JOIN beneficiaries_village v ON h.village_id = v.id
        INNER JOIN beneficiaries_district d ON v.district_id = d.id
        INNER JOIN inventory_aiddistribution ad ON ad.household_id = h.id
        INNER JOIN inventory_inventory inv ON ad.inventory_id = inv.id
        INNER JOIN projects_project p ON ad.project_id = p.id
        WHERE h.is_widow_headed = TRUE AND d.name = 'Lasbela'
        ORDER BY ad.distribution_date DESC
    """


class ProjectBudgetUtilizationReportView(BaseReportView):
    """Budget vs spent with utilisation percentage."""
    query = """
        SELECT
            p.name AS project_name,
            p.budget_pkr,
            p.spent_amount AS spent_pkr,
            (p.budget_pkr - p.spent_amount) AS remaining_pkr,
            CASE
                WHEN p.budget_pkr > 0
                THEN ROUND((p.spent_amount / p.budget_pkr) * 100, 2)
                ELSE 0.00
            END AS utilization_percentage,
            p.status,
            COALESCE(SUM(ad.quantity_distributed), 0) AS total_items_distributed
        FROM projects_project p
        LEFT JOIN inventory_aiddistribution ad ON ad.project_id = p.id
        GROUP BY p.id
        ORDER BY utilization_percentage DESC
    """


class InventoryShortageReportView(BaseReportView):
    """Items below reorder level."""
    query = """
        SELECT
            item_name,
            item_type,
            quantity_available,
            reorder_level,
            (reorder_level - quantity_available) AS shortage_deficit,
            unit
        FROM inventory_inventory
        WHERE quantity_available <= reorder_level
        ORDER BY shortage_deficit DESC
    """


class VolunteerSkillAvailabilityReportView(BaseReportView):
    """Volunteers grouped by skill and availability status."""
    query = """
        SELECT
            s.name AS skill_name,
            COUNT(DISTINCT v.id) AS total_volunteers,
            SUM(CASE WHEN v.status = 'AVAILABLE' THEN 1 ELSE 0 END) AS volunteers_available,
            SUM(CASE WHEN v.status = 'ON_ASSIGNMENT' THEN 1 ELSE 0 END) AS volunteers_on_assignment,
            SUM(CASE WHEN v.status = 'INACTIVE' THEN 1 ELSE 0 END) AS volunteers_inactive
        FROM volunteers_skill s
        LEFT JOIN volunteers_volunteerskill vs ON vs.skill_id = s.id
        LEFT JOIN volunteers_volunteer v ON vs.volunteer_id = v.id
        GROUP BY s.id, s.name
        ORDER BY total_volunteers DESC
    """
