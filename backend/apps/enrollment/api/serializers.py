from rest_framework import serializers
from apps.enrollment.domain.models import StudentProfile, StudentAcademicHistory
from apps.auth_users.models import User
from apps.curriculum.api.serializers import CourseSerializer

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = (
            'phone', 'address', 'birth_date', 'blood_type', 'medical_notes',
            'guardian_name', 'guardian_relation', 'guardian_phone', 'guardian_email'
        )

class StudentAcademicHistorySerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = StudentAcademicHistory
        fields = ('id', 'year', 'degree', 'course', 'course_name')

class StudentSerializer(serializers.ModelSerializer):
    profile = StudentProfileSerializer(source='student_profile', required=False)
    course_detail = CourseSerializer(source='current_course', read_only=True)
    academic_history = StudentAcademicHistorySerializer(many=True, read_only=True)
    
    # Mock data fields required by the UI mockup
    performance = serializers.SerializerMethodField()
    disciplineCases = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'role', 'is_active',
            'current_course', 'current_degree', 'course_detail', 'profile',
            'performance', 'disciplineCases', 'enrollment_status', 'academic_history'
        )
        read_only_fields = ('id', 'role', 'academic_history')

    def get_performance(self, obj):
        # Deterministic mock performance based on user ID
        gpas = [4.2, 3.8, 4.8, 3.5, 4.0, 4.5, 3.9, 4.7]
        attendances = [95, 88, 99, 92, 90, 96, 87, 98]
        idx = (obj.id or 0) % len(gpas)
        return {
            "gpa": gpas[idx],
            "attendance": attendances[idx],
            "lastPeriodRank": f"{(obj.id % 20) + 1}/35"
        }

    def get_disciplineCases(self, obj):
        # Deterministic mock discipline cases based on user ID
        if obj.id % 5 == 0:
            return [
                {
                    "id": f"#CONV-2023-{100 + obj.id}",
                    "date": "15 Oct 2023",
                    "type": "Falta Tipo I",
                    "status": "Pendiente Citación"
                }
            ]
        elif obj.id % 7 == 0:
            return [
                {
                    "id": f"#CONV-2023-{200 + obj.id}",
                    "date": "10 Sep 2023",
                    "type": "Falta Tipo II",
                    "status": "En Seguimiento"
                }
            ]
        return []

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('student_profile', None)
        
        # Update user fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.current_course = validated_data.get('current_course', instance.current_course)
        instance.current_degree = validated_data.get('current_degree', instance.current_degree)
        instance.enrollment_status = validated_data.get('enrollment_status', instance.enrollment_status)
        instance.save()
        
        # Update or create profile
        if profile_data:
            StudentProfile.objects.update_or_create(
                user=instance,
                defaults=profile_data
            )
            
        return instance
