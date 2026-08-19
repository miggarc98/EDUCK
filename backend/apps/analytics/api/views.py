from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils import timezone
from apps.auth_users.models import User
from apps.behavior.models import IncidentReport
from apps.academics.models import ClassSchedule

class DashboardSummaryAPIView(APIView):
    """
    Retorna los KPIs principales para el Tablero de Control de directivos.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        
        total_students = User.objects.filter(role='student', is_active=True).count()
        total_teachers = User.objects.filter(role='teacher', is_active=True).count()
        
        open_incidents = IncidentReport.objects.filter(status='OPEN').count()
        incidents_this_month = IncidentReport.objects.filter(
            incident_date__year=now.year,
            incident_date__month=now.month
        ).count()

        active_classes = ClassSchedule.objects.count()

        return Response({
            "students": {"total_active": total_students},
            "teachers": {"total_active": total_teachers},
            "behavior": {
                "open_cases": open_incidents,
                "cases_this_month": incidents_this_month
            },
            "academics": {
                "active_classes": active_classes
            }
        })
