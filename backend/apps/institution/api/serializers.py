from rest_framework import serializers
from apps.institution.models import InstitutionSetting

class InstitutionSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionSetting
        fields = [
            'id',
            'name',
            'dane_nit',
            'address',
            'phone',
            'email',
            'logo_url',
            'is_formal_education',
            'academic_year',

            'active_period',
            'start_time',
            'end_time',
            'shifts',
            'block_duration_minutes',
            'default_teacher_max_hours',
            'general_scale',
            'decimal_precision',
            'min_passing_grade',
            'independent_scale_per_level',
            'level_scales',
            'offered_degrees',
            'settings_json',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
