from rest_framework import serializers
from apps.behavior.models import (
    BehaviorRule,
    IncidentReport,
    IncidentInvolvement,
    DisciplinaryAction
)

class BehaviorRuleSerializer(serializers.ModelSerializer):
    fault_type_display = serializers.CharField(source='get_fault_type_display', read_only=True)

    class Meta:
        model = BehaviorRule
        fields = '__all__'

class IncidentInvolvementSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    rule_broken_name = serializers.CharField(source='rule_broken.name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = IncidentInvolvement
        fields = '__all__'

class DisciplinaryActionSerializer(serializers.ModelSerializer):
    responsible_name = serializers.CharField(source='responsible.get_full_name', read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)

    class Meta:
        model = DisciplinaryAction
        fields = '__all__'

class IncidentReportSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source='reported_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    involvements = IncidentInvolvementSerializer(many=True, read_only=True)
    actions = DisciplinaryActionSerializer(many=True, read_only=True)

    class Meta:
        model = IncidentReport
        fields = '__all__'
        read_only_fields = ('reported_by',)
