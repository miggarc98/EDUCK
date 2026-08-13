from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.core.models import AuditLog
from apps.core.api.serializers import AuditLogSerializer
from apps.core.services.audit_service import AuditLogService


class IsAdminUserOrSuperAdmin(permissions.BasePermission):
    """
    Permite acceso solo a usuarios administradores o superadministradores.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user, 'role', '')
        return role in ['admin', 'superadmin'] or request.user.is_superuser


class AuditLogListView(APIView):
    """
    API Endpoint para consultar registros inmutables de auditoría y trazabilidad.
    Soporta filtrado por módulo ('module'), ID de objeto ('object_id') y tipo de acción ('action_type').
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = AuditLog.objects.all()

        module = request.query_params.get('module')
        if module:
            queryset = queryset.filter(module__iexact=module)

        object_id = request.query_params.get('object_id')
        if object_id:
            queryset = queryset.filter(object_id=str(object_id))

        action_type = request.query_params.get('action_type')
        if action_type:
            queryset = queryset.filter(action_type=action_type)

        serializer = AuditLogSerializer(queryset[:100], many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        return Response(
            {"detail": "Los registros de auditoría son inmutables y no se pueden eliminar."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )


class AuditLogRestoreView(APIView):
    """
    API Endpoint para restaurar una entidad al estado registrado en un AuditLog específico.
    Crea un nuevo evento inmutable de auditoría con tipo RESTORE.
    """
    permission_classes = [IsAdminUserOrSuperAdmin]

    def post(self, request, pk):
        try:
            audit_log = AuditLog.objects.get(pk=pk)
        except AuditLog.DoesNotExist:
            return Response({"detail": "Registro de auditoría no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        try:
            instance, new_log = AuditLogService.restore_snapshot(audit_log, request)
            return Response(
                {
                    "detail": f"Configuración restaurada con éxito a la versión del {audit_log.created_at.strftime('%Y-%m-%d %H:%M:%S')}.",
                    "audit_log_id": new_log.id
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"detail": f"Error al restaurar la versión: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, *args, **kwargs):
        return Response(
            {"detail": "Los registros de auditoría son inmutables y no se pueden eliminar."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
