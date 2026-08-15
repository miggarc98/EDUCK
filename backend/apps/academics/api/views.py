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
            
        return queryset


from apps.academics.models import ClassSchedule
from apps.academics.api.serializers import ClassScheduleSerializer
from apps.core.services.audit_service import AuditLogService
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.academics.use_cases.schedule_generator import ScheduleGeneratorService

class ClassScheduleViewSet(viewsets.ModelViewSet):
    queryset = ClassSchedule.objects.all().order_by('day', 'time_slot')
    serializer_class = ClassScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        teacher_id = self.request.query_params.get('teacher')
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
        day = self.request.query_params.get('day')
        if day:
            queryset = queryset.filter(day=day)
        return queryset

    def perform_create(self, serializer):
        instance = serializer.save()
        AuditLogService.log_change(
            instance=instance,
            request=self.request,
            action_type='CREATE',
            old_snapshot=None,
            module='institution',
            entity_name=f"Creado Horario: {instance.course.name} - {instance.day} {instance.time_slot} ({instance.subject.name})"
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
            entity_name=f"Actualizado Horario: {updated_instance.course.name} - {updated_instance.day} {updated_instance.time_slot} ({updated_instance.subject.name})"
        )

    def perform_destroy(self, instance):
        old_snapshot = AuditLogService.serialize_instance(instance)
        AuditLogService.log_change(
            instance=instance,
            request=self.request,
            action_type='DELETE',
            old_snapshot=old_snapshot,
            module='institution',
            entity_name=f"Eliminado Horario: {instance.course.name} - {instance.day} {instance.time_slot} ({instance.subject.name})"
        )
        instance.delete()

    @action(detail=False, methods=['post'])
    def generate(self, request):
        course_ids = request.data.get('courses')
        overwrite = request.data.get('overwrite', False)
        
        generator = ScheduleGeneratorService(
            course_ids=course_ids if course_ids else None,
            overwrite=overwrite
        )
        
        results = generator.generate()
        return Response({
            'message': f"Generación completada. Se asignaron {results['scheduled']} bloques.",
            'results': results
        })

