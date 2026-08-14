from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.auth_users.models import User, UserRole
from apps.enrollment.api.serializers import StudentSerializer
from apps.auth_users.api.views import StandardResultsSetPagination

class StudentViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(role=UserRole.STUDENT).order_by('id')
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by degree
        degree = self.request.query_params.get('degree')
        if degree:
            queryset = queryset.filter(current_degree__iexact=degree)
            
        # Filter by email
        email = self.request.query_params.get('email')
        if email:
            queryset = queryset.filter(email__icontains=email)
            
        # Filter by name
        name = self.request.query_params.get('name')
        if name:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(first_name__icontains=name) | 
                Q(last_name__icontains=name)
            )
            
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(current_course_id=course_id)
            
        # General search filter
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(first_name__icontains=search) | 
                Q(last_name__icontains=search) | 
                Q(email__icontains=search)
            )
        return queryset
