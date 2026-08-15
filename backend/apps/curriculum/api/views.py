from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.curriculum.domain.models import Course, Area, Subject
from apps.curriculum.api.serializers import CourseSerializer, AreaSerializer, SubjectSerializer

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by('name')
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.all().order_by('name')
    serializer_class = AreaSerializer
    permission_classes = [IsAuthenticated]

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all().order_by('name')
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        area_id = self.request.query_params.get('area')
        if area_id:
            queryset = queryset.filter(area_id=area_id)
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(courses__id=course_id)
        return queryset

