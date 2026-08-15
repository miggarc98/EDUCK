from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.curriculum.domain.models import Course, Area, Subject
from apps.curriculum.api.serializers import CourseSerializer, AreaSerializer, SubjectSerializer
from apps.curriculum.use_cases.seed_ley115 import seed_ley115_curriculum
from apps.institution.models import InstitutionSetting
from apps.core.services.audit_service import AuditLogService

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by('name')
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save()
        AuditLogService.log_change(
            instance=instance,
            request=self.request,
            action_type='CREATE',
            old_snapshot=None,
            module='institution',
            entity_name=f"Creado Curso: {instance.name}"
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        old_snapshot = AuditLogService.serialize_instance(instance)
        updated_instance = serializer.save()
        AuditLogService.log_change(
            instance=updated_instance,
            request=self.request,
            action_type='UPDATE',
            old_snapshot=old_snapshot,
            module='institution',
            entity_name=f"Actualizado Curso: {updated_instance.name}"
        )

    def perform_destroy(self, instance):
        old_snapshot = AuditLogService.serialize_instance(instance)
        AuditLogService.log_change(
            instance=instance,
            request=self.request,
            action_type='DELETE',
            old_snapshot=old_snapshot,
            module='institution',
            entity_name=f"Eliminado Curso: {instance.name}"
        )
        instance.delete()

class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.all().order_by('name')
    serializer_class = AreaSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save()
        AuditLogService.log_change(
            instance=instance,
            request=self.request,
            action_type='CREATE',
            old_snapshot=None,
            module='institution',
            entity_name=f"Creado Área: {instance.name}"
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        old_snapshot = AuditLogService.serialize_instance(instance)
        updated_instance = serializer.save()
        AuditLogService.log_change(
            instance=updated_instance,
            request=self.request,
            action_type='UPDATE',
            old_snapshot=old_snapshot,
            module='institution',
            entity_name=f"Actualizado Área: {updated_instance.name}"
        )

    def perform_destroy(self, instance):
        old_snapshot = AuditLogService.serialize_instance(instance)
        AuditLogService.log_change(
            instance=instance,
            request=self.request,
            action_type='DELETE',
            old_snapshot=old_snapshot,
            module='institution',
            entity_name=f"Eliminado Área: {instance.name}"
        )
        instance.delete()

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
        area_instance = Area.objects.first()
        if area_instance:
            AuditLogService.log_change(
                instance=area_instance,
                request=request,
                action_type='CREATE',
                old_snapshot=None,
                module='institution',
                entity_name=f"Precarga de plan de estudios Ley 115 ({result.get('areas_created', 0)} áreas, {result.get('subjects_created', 0)} asignaturas)"
            )
        return Response(result, status=status.HTTP_200_OK)


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all().order_by('name')
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save()
        AuditLogService.log_change(
            instance=instance,
            request=self.request,
            action_type='CREATE',
            old_snapshot=None,
            module='institution',
            entity_name=f"Creado Asignatura: {instance.name}"
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        old_snapshot = AuditLogService.serialize_instance(instance)
        updated_instance = serializer.save()
        AuditLogService.log_change(
            instance=updated_instance,
            request=self.request,
            action_type='UPDATE',
            old_snapshot=old_snapshot,
            module='institution',
            entity_name=f"Actualizado Asignatura: {updated_instance.name}"
        )

    def perform_destroy(self, instance):
        old_snapshot = AuditLogService.serialize_instance(instance)
        AuditLogService.log_change(
            instance=instance,
            request=self.request,
            action_type='DELETE',
            old_snapshot=old_snapshot,
            module='institution',
            entity_name=f"Eliminado Asignatura: {instance.name}"
        )
        instance.delete()

    def get_queryset(self):
        queryset = super().get_queryset()
        area_id = self.request.query_params.get('area')
        if area_id:
            queryset = queryset.filter(area_id=area_id)
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(courses__id=course_id)
        return queryset

