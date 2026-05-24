from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.beneficiaries.urls')),
    path('api/', include('apps.projects.urls')),
    path('api/', include('apps.donors.urls')),
    path('api/', include('apps.volunteers.urls')),
    path('api/', include('apps.inventory.urls')),
    path('api/reports/', include('apps.reports.urls')),
]
