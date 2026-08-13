from rest_framework import serializers
from apps.core.models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'content_type',
            'object_id',
            'user',
            'user_name',
            'user_email',
            'user_role',
            'ip_address',
            'user_agent',
            'action_type',
            'action_type_display',
            'module',
            'entity_name',
            'changes',
            'snapshot',
            'created_at',
        ]
        read_only_fields = fields
