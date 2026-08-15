from rest_framework import serializers
from apps.auth_users.models import User
from apps.academics.models import TeacherProfile

class TeacherProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherProfile
        fields = ('employee_id', 'area', 'academic_load', 'status', 'availability')
        read_only_fields = ('employee_id',)

class TeacherSerializer(serializers.ModelSerializer):
    profile = TeacherProfileSerializer(source='teacher_profile', read_only=True)
    
    # Flat mapped fields to make frontend integration simpler and match the mockup exactly
    name = serializers.SerializerMethodField()
    employee_id = serializers.CharField(source='teacher_profile.employee_id', read_only=True)
    area = serializers.CharField(source='teacher_profile.area', required=False, allow_blank=True)
    load = serializers.IntegerField(source='teacher_profile.academic_load', required=False, default=0)
    status = serializers.CharField(source='teacher_profile.status', required=False, default='active')
    availability = serializers.JSONField(source='teacher_profile.availability', required=False, default=dict)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'name', 'role', 'is_active',
            'profile', 'employee_id', 'area', 'load', 'status', 'password', 'availability'
        )
        read_only_fields = ('id', 'role', 'name', 'is_active')

    def get_name(self, obj):
        name_str = f"{obj.first_name} {obj.last_name}".strip()
        return name_str if name_str else obj.email

    def create(self, validated_data):
        profile_data = validated_data.pop('teacher_profile', {})
        email = validated_data.get('email')
        password = validated_data.pop('password', 'Educk2026!')
        
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role='teacher'
        )
        
        # Update/Create profile
        TeacherProfile.objects.create(
            user=user,
            area=profile_data.get('area', ''),
            academic_load=profile_data.get('academic_load', 0),
            status=profile_data.get('status', 'active'),
            availability=profile_data.get('availability', {})
        )
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('teacher_profile', {})
        
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        if 'email' in validated_data:
            instance.email = validated_data.get('email', instance.email)
        instance.save()
        
        profile, _ = TeacherProfile.objects.get_or_create(user=instance)
        if 'area' in profile_data:
            profile.area = profile_data.get('area')
        if 'academic_load' in profile_data:
            profile.academic_load = profile_data.get('academic_load')
        if 'status' in profile_data:
            profile.status = profile_data.get('status')
        if 'availability' in profile_data:
            profile.availability = profile_data.get('availability')
        profile.save()
        
        return instance


from apps.academics.models import ClassSchedule

class ClassScheduleSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ClassSchedule
        fields = (
            'id', 'course', 'course_name', 'day', 'time_slot', 
            'subject', 'subject_name', 'teacher', 'teacher_name', 'room'
        )

    def get_teacher_name(self, obj):
        name_str = f"{obj.teacher.first_name} {obj.teacher.last_name}".strip()
        return name_str if name_str else obj.teacher.email

    def validate(self, attrs):
        teacher = attrs.get('teacher', self.instance.teacher if self.instance else None)
        day = attrs.get('day', self.instance.day if self.instance else None)
        time_slot = attrs.get('time_slot', self.instance.time_slot if self.instance else None)
        course = attrs.get('course', self.instance.course if self.instance else None)
        subject = attrs.get('subject', self.instance.subject if self.instance else None)

        # 1. Validate Teacher Availability
        if teacher and day and time_slot:
            profile = getattr(teacher, 'teacher_profile', None)
            if profile and profile.availability:
                day_availability = profile.availability.get(day)
                if day_availability:
                    start_avail = day_availability.get('start_time')
                    end_avail = day_availability.get('end_time')
                    if start_avail and end_avail:
                        import re
                        match = re.match(r'(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})', time_slot)
                        if match:
                            slot_start, slot_end = match.groups()
                            def to_min(t_str):
                                h, m = map(int, t_str.split(':'))
                                return h * 60 + m
                            
                            if to_min(slot_start) < to_min(start_avail) or to_min(slot_end) > to_min(end_avail):
                                raise serializers.ValidationError(
                                    f"El docente no está disponible en este horario ({slot_start} - {slot_end}). "
                                    f"Su disponibilidad para el {day} es de {start_avail} a {end_avail}."
                                )

        # 2. Validate Subject Weekly Intensity Limit
        if course and subject:
            weekly_limit = getattr(subject, 'weekly_hours', 1)
            existing_schedules = ClassSchedule.objects.filter(
                course=course,
                subject=subject
            )
            if self.instance and self.instance.pk:
                existing_schedules = existing_schedules.exclude(pk=self.instance.pk)
                
            current_count = existing_schedules.count()
            if current_count >= weekly_limit:
                raise serializers.ValidationError(
                    f"La asignatura {subject.name} ya alcanzó su intensidad horaria semanal máxima "
                    f"de {weekly_limit} bloque(s) en el curso {course.name}."
                )

        return attrs

