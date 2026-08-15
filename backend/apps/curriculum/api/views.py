from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.curriculum.domain.models import Course, Area, Subject
from apps.curriculum.api.serializers import CourseSerializer, AreaSerializer, SubjectSerializer
from apps.curriculum.use_cases.seed_ley115 import seed_ley115_curriculum
from apps.institution.models import InstitutionSetting

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by('name')
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.all().order_by('name')
    serializer_class = AreaSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        setting = InstitutionSetting.get_solo()
        if instance.is_mandatory and setting.is_formal_education:
            return Response(
                {"detail": "No se puede eliminar un área obligatoria Ley 115 mientras el régimen de Educación Formal esté activo."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['post'])
    def seed_ley115(self, request):
        result = seed_ley115_curriculum()
        return Response(result, status=status.HTTP_200_OK)


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

