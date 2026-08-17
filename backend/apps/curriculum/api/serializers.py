from rest_framework import serializers
from apps.curriculum.domain.models import Course, Area, Subject
from apps.auth_users.api.serializers import UserSerializer
from apps.auth_users.models import User, UserRole

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ('id', 'name', 'description', 'is_mandatory', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class SubjectSerializer(serializers.ModelSerializer):
    area_detail = AreaSerializer(source='area', read_only=True)
    courses_detail = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Subject
        fields = (
            'id', 
            'name', 
            'description', 
            'area', 
            'area_detail', 
            'courses', 
            'courses_detail', 
            'weekly_hours',
            'weekly_hours_overrides',
            'is_active', 
            'created_at', 
            'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_courses_detail(self, obj):
        return [{'id': c.id, 'name': c.name} for c in obj.courses.all()]

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
    subjects_count = serializers.SerializerMethodField()

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
            'attendance',
            'subjects_count'
        )
        read_only_fields = ('id',)

    def get_students(self, obj):
        return obj.students.count()

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

    def get_subjects_count(self, obj):
        return obj.subjects.count()

