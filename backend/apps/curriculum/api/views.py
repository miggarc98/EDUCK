from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.curriculum.domain.models import Course
from apps.curriculum.api.serializers import CourseSerializer

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by('name')
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
