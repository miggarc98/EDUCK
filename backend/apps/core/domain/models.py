from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.core.exceptions import ValidationError

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Creación'),
        ('UPDATE', 'Actualización'),
        ('RESTORE', 'Restauración'),
        ('DELETE', 'Eliminación'),
    ]

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.CharField(max_length=255)
    content_object = GenericForeignKey('content_type', 'object_id')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    user_name = models.CharField(max_length=255, blank=True, default='')
    user_email = models.CharField(max_length=255, blank=True, default='')
    user_role = models.CharField(max_length=50, blank=True, default='')

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')

    action_type = models.CharField(max_length=50, choices=ACTION_CHOICES, default='UPDATE')
    module = models.CharField(max_length=100, blank=True, default='')
    entity_name = models.CharField(max_length=255, blank=True, default='')

    changes = models.JSONField(default=dict, blank=True)
    snapshot = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
        verbose_name = 'Registro de Auditoría'
        verbose_name_plural = 'Registros de Auditoría'

    def __str__(self):
        return f"AuditLog({self.module} - {self.action_type} por {self.user_name or 'Sistema'} en {self.created_at})"

    def delete(self, *args, **kwargs):
        raise ValidationError("Los registros de auditoría e historial son inmutables y no se pueden eliminar.")
