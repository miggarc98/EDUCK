import json
from decimal import Decimal
from datetime import datetime, date
from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict
from apps.core.models import AuditLog


def get_client_ip(request):
    """Obtiene la dirección IP real del cliente considerando proxies."""
    if not request:
        return '127.0.0.1'
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
    return ip


def json_serialize_value(val):
    """Convierte valores no serializables en JSON (Decimal, datetime, etc.)."""
    if isinstance(val, (Decimal, float)):
        return float(val)
    if isinstance(val, (datetime, date)):
        return val.isoformat()
    if isinstance(val, dict):
        return {k: json_serialize_value(v) for k, v in val.items()}
    if isinstance(val, list):
        return [json_serialize_value(v) for v in val]
    if hasattr(val, 'pk'):
        return val.pk
    return val


class AuditLogService:

    @staticmethod
    def serialize_instance(instance):
        """
        Genera un diccionario serializable en JSON con todos los campos del modelo.
        """
        snapshot = {}
        for field in instance._meta.fields:
            # Si el campo es una relación ForeignKey, accedemos al ID directamente (attname)
            # para evitar serializar el objeto relacionado completo y prevenir consultas SQL adicionales.
            name = field.attname if isinstance(field, models.ForeignKey) else field.name
            val = getattr(instance, name)
            snapshot[field.name] = json_serialize_value(val)
        return snapshot

    @staticmethod
    def compute_diff(old_snapshot, new_snapshot, exclude_fields=None):
        """
        Calcula las diferencias campo por campo entre dos snapshots.
        Retorna un dict: { campo: { 'old': val_anterior, 'new': val_nuevo } }
        """
        exclude_fields = set(exclude_fields or ['id', 'created_at', 'updated_at'])
        diff = {}
        all_keys = set(old_snapshot.keys()) | set(new_snapshot.keys())

        for key in all_keys:
            if key in exclude_fields:
                continue
            old_val = old_snapshot.get(key)
            new_val = new_snapshot.get(key)
            if old_val != new_val:
                diff[key] = {
                    'old': old_val,
                    'new': new_val
                }
        return diff

    @classmethod
    def log_change(cls, instance, request, action_type='UPDATE', old_snapshot=None, module='', entity_name=''):
        """
        Crea un nuevo registro de auditoría inmutable.
        """
        user = getattr(request, 'user', None) if request else None
        if user and not user.is_authenticated:
            user = None

        user_name = ''
        user_email = ''
        user_role = ''

        if user:
            user_name = getattr(user, 'get_full_name', lambda: '')() or getattr(user, 'username', '') or str(user)
            user_email = getattr(user, 'email', '')
            user_role = getattr(user, 'role', '') or ('SuperAdmin' if getattr(user, 'is_superuser', False) else 'Usuario')

        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '') if request else ''

        content_type = ContentType.objects.get_for_model(instance)
        new_snapshot = cls.serialize_instance(instance)

        changes = {}
        if old_snapshot:
            changes = cls.compute_diff(old_snapshot, new_snapshot)

        if not entity_name:
            entity_name = str(instance)

        audit_entry = AuditLog.objects.create(
            content_type=content_type,
            object_id=str(instance.pk),
            user=user,
            user_name=user_name,
            user_email=user_email,
            user_role=user_role,
            ip_address=ip_address,
            user_agent=user_agent,
            action_type=action_type,
            module=module or instance._meta.app_label,
            entity_name=entity_name,
            changes=changes,
            snapshot=new_snapshot
        )
        return audit_entry

    @classmethod
    def restore_snapshot(cls, audit_log, request):
        """
        Restaura un modelo a un snapshot de auditoría anterior y registra la acción RESTORE.
        """
        instance = audit_log.content_object
        is_recreated = False
        if not instance:
            # En caso de que se necesite re-instanciar por ID
            model_cls = audit_log.content_type.model_class()
            try:
                instance = model_cls.objects.get(pk=audit_log.object_id)
            except model_cls.DoesNotExist:
                # Si el objeto fue eliminado físicamente, lo instanciamos de nuevo con el mismo ID
                instance = model_cls()
                pk_field = model_cls._meta.pk
                pk_val = audit_log.object_id
                if isinstance(pk_field, (models.AutoField, models.BigAutoField, models.IntegerField)):
                    try:
                        pk_val = int(pk_val)
                    except ValueError:
                        pass
                setattr(instance, pk_field.name, pk_val)
                is_recreated = True

        old_snapshot = cls.serialize_instance(instance) if not is_recreated else {}
        target_snapshot = audit_log.snapshot or {}

        # Aplicar valores del snapshot al modelo
        for field in instance._meta.fields:
            field_name = field.name
            if field_name in target_snapshot and field_name not in ['id', 'created_at']:
                val = target_snapshot[field_name]
                if isinstance(field, models.ForeignKey):
                    setattr(instance, field.attname, val)
                else:
                    setattr(instance, field_name, val)

        instance.save()

        # Registrar la restauración como un nuevo evento inmutable
        new_audit_log = cls.log_change(
            instance=instance,
            request=request,
            action_type='RESTORE',
            old_snapshot=old_snapshot,
            module=audit_log.module,
            entity_name=f"Restaurado a versión del {audit_log.created_at.strftime('%Y-%m-%d %H:%M')}"
        )
        return instance, new_audit_log
