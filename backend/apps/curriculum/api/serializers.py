from rest_framework import serializers
from apps.curriculum.domain.models import Course
from apps.auth_users.api.serializers import UserSerializer
from apps.auth_users.models import User, UserRole

class CourseSerializer(serializers.ModelSerializer):
    director_detail = UserSerializer(source='director', read_only=True)
    director = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=UserRole.TEACHER),
        required=False,
        allow_null=True
    )
    
    # Temporary fields hardcoded as requested
    students = serializers.SerializerMethodField()
    avgGrade = serializers.SerializerMethodField()
    attendance = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            'id', 
            'name', 
            'level', 
            'degree', 
            'director', 
            'director_detail', 
            'is_active', 
            'students', 
            'avgGrade', 
            'attendance'
        )
        read_only_fields = ('id',)

    def get_students(self, obj):
        # Temporary hardcoded value (e.g. 30 + obj.id)
        val = 30
        if obj.id:
            val += (obj.id % 8)
        return val

    def get_avgGrade(self, obj):
        # Temporary hardcoded value
        grades = ["4.2", "3.9", "4.5", "4.1", "3.8", "4.3", "4.6", "4.7"]
        idx = (obj.id or 0) % len(grades)
        return grades[idx]

    def get_attendance(self, obj):
        # Temporary hardcoded value
        attendances = ["95%", "92%", "98%", "94%", "90%", "96%", "97%", "98%"]
        idx = (obj.id or 0) % len(attendances)
        return attendances[idx]
