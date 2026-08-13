from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.institution.models import InstitutionSetting
from apps.institution.api.serializers import InstitutionSettingSerializer
from apps.core.services.audit_service import AuditLogService

class IsAdminOrSuperAdminOrReadOnly(permissions.BasePermission):
    """
    Permite lectura a cualquier usuario autenticado del tenant.
    Permite escritura/actualización solo a usuarios con rol admin o superadmin.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return getattr(request.user, 'role', '') in ['admin', 'superadmin'] or request.user.is_superuser

class InstitutionSettingView(APIView):
    """
    API Endpoints para consultar y actualizar las configuraciones privadas de la institución.
    Mantiene un Singleton por esquema de tenant.
    """
    permission_classes = [IsAdminOrSuperAdminOrReadOnly]

    def get(self, request):
        setting = InstitutionSetting.get_solo()
        serializer = InstitutionSettingSerializer(setting)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        return self._update_settings(request, partial=False)

    def patch(self, request):
        return self._update_settings(request, partial=True)

    def _update_settings(self, request, partial=False):
        setting = InstitutionSetting.get_solo()
        old_snapshot = AuditLogService.serialize_instance(setting)
        serializer = InstitutionSettingSerializer(setting, data=request.data, partial=partial)
        if serializer.is_valid():
            updated_setting = serializer.save()
            AuditLogService.log_change(
                instance=updated_setting,
                request=request,
                action_type='UPDATE',
                old_snapshot=old_snapshot,
                module='institution',
                entity_name=f"Configuración de {updated_setting.name}"
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
