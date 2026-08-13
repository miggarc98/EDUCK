from django.urls import path
from apps.core.api.views import AuditLogListView, AuditLogRestoreView

urlpatterns = [
    path('audit-logs/', AuditLogListView.as_view(), name='audit-logs-list'),
    path('audit-logs/<int:pk>/restore/', AuditLogRestoreView.as_view(), name='audit-logs-restore'),
]
