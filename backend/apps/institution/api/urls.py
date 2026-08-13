from django.urls import path
from apps.institution.api.views import InstitutionSettingView
from apps.core.api.views import AuditLogListView, AuditLogRestoreView

urlpatterns = [
    path('settings/', InstitutionSettingView.as_view(), name='institution-settings'),
    path('settings/history/', AuditLogListView.as_view(), name='institution-settings-history'),
    path('settings/history/<int:pk>/restore/', AuditLogRestoreView.as_view(), name='institution-settings-history-restore'),
]
