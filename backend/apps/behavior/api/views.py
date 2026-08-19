from rest_framework import viewsets, permissions
from apps.behavior.models import (
    BehaviorRule,
    IncidentReport,
    IncidentInvolvement,
    DisciplinaryAction
)
from apps.behavior.api.serializers import (
    BehaviorRuleSerializer,
    IncidentReportSerializer,
    IncidentInvolvementSerializer,
    DisciplinaryActionSerializer
)

class BehaviorRuleViewSet(viewsets.ModelViewSet):
    queryset = BehaviorRule.objects.all().order_by('name')
    serializer_class = BehaviorRuleSerializer
    permission_classes = [permissions.IsAuthenticated]

class IncidentReportViewSet(viewsets.ModelViewSet):
    queryset = IncidentReport.objects.all().order_by('-incident_date')
    serializer_class = IncidentReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Asigna automáticamente al usuario que reporta
        serializer.save(reported_by=self.request.user)

class IncidentInvolvementViewSet(viewsets.ModelViewSet):
    queryset = IncidentInvolvement.objects.all()
    serializer_class = IncidentInvolvementSerializer
    permission_classes = [permissions.IsAuthenticated]

class DisciplinaryActionViewSet(viewsets.ModelViewSet):
    queryset = DisciplinaryAction.objects.all()
    serializer_class = DisciplinaryActionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Asigna automáticamente al responsable
        serializer.save(responsible=self.request.user)
