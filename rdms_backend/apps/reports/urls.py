from django.urls import path
from .views import (
    DonorImpactReportView,
    DonationAllocationReportView,
    BeneficiaryAidHistoryReportView,
    VillagePovertyProfileReportView,
    WidowsReliefReportView,
    ProjectBudgetUtilizationReportView,
    InventoryShortageReportView,
    VolunteerSkillAvailabilityReportView,
)

urlpatterns = [
    path('donor-impact/', DonorImpactReportView.as_view(), name='report_donor_impact'),
    path('allocations/', DonationAllocationReportView.as_view(), name='report_allocations'),
    path('aid-history/', BeneficiaryAidHistoryReportView.as_view(), name='report_aid_history'),
    path('poverty-profile/', VillagePovertyProfileReportView.as_view(), name='report_poverty_profile'),
    path('widows-relief/', WidowsReliefReportView.as_view(), name='report_widows_relief'),
    path('project-utilization/', ProjectBudgetUtilizationReportView.as_view(), name='report_project_utilization'),
    path('inventory-shortages/', InventoryShortageReportView.as_view(), name='report_inventory_shortages'),
    path('volunteer-skills/', VolunteerSkillAvailabilityReportView.as_view(), name='report_volunteer_skills'),
]
