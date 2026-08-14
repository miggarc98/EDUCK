from rest_framework import serializers
from apps.auth_users.models import User
from apps.academics.models import TeacherProfile

class TeacherProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherProfile
        fields = ('employee_id', 'area', 'academic_load', 'status')
        read_only_fields = ('employee_id',)

class TeacherSerializer(serializers.ModelSerializer):
    profile = TeacherProfileSerializer(source='teacher_profile', read_only=True)
    
    # Flat mapped fields to make frontend integration simpler and match the mockup exactly
    name = serializers.SerializerMethodField()
    employee_id = serializers.CharField(source='teacher_profile.employee_id', read_only=True)
    area = serializers.CharField(source='teacher_profile.area', required=False, allow_blank=True)
    load = serializers.IntegerField(source='teacher_profile.academic_load', required=False, default=0)
    status = serializers.CharField(source='teacher_profile.status', required=False, default='active')
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'name', 'role', 'is_active',
            'profile', 'employee_id', 'area', 'load', 'status', 'password'
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
            status=profile_data.get('status', 'active')
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
        profile.save()
        
        return instance
