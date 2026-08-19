from django.urls import path
from apps.analytics.api.views import DashboardSummaryAPIView

urlpatterns = [
    path('dashboard/summary/', DashboardSummaryAPIView.as_view(), name='dashboard-summary'),
]
