from rest_framework import viewsets, permissions
from apps.auth_users.models import User
from apps.academics.api.serializers import TeacherSerializer
from django.db.models import Q

class TeacherViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.filter(role='teacher').order_by('id')
        
        # Filter by generic search (name, email, area, ID)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(teacher_profile__area__icontains=search) |
                Q(teacher_profile__employee_id__icontains=search)
            )
            
        # Specific filtering options
        area = self.request.query_params.get('area', None)
        if area:
            queryset = queryset.filter(teacher_profile__area__icontains=area)
            
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(teacher_profile__status=status)
            
        return queryset
