from django.db import models
from django.conf import settings
from apps.core.domain.models import TimeStampedModel

class AudienceTypeChoices(models.TextChoices):
    ALL = 'ALL', 'Toda la Comunidad'
    PARENTS = 'PARENTS', 'Padres de Familia'
    TEACHERS = 'TEACHERS', 'Docentes'
    STUDENTS = 'STUDENTS', 'Estudiantes'

class Announcement(TimeStampedModel):
    title = models.CharField(max_length=255, verbose_name="Título del Comunicado")
    body = models.TextField(verbose_name="Cuerpo del mensaje")
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='announcements_sent',
        verbose_name="Remitente"
    )
    audience_type = models.CharField(
        max_length=20,
        choices=AudienceTypeChoices.choices,
        default=AudienceTypeChoices.ALL,
        verbose_name="Público Objetivo"
    )

    class Meta:
        db_table = 'communications_announcements'
        verbose_name = 'Comunicado Oficial'
        verbose_name_plural = 'Comunicados Oficiales'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - Para: {self.get_audience_type_display()}"


class NotificationTypeChoices(models.TextChoices):
    CITATION = 'CITATION', 'Citación'
    ACADEMIC_REPORT = 'ACADEMIC_REPORT', 'Reporte Académico'
    BEHAVIOR_ALERT = 'BEHAVIOR_ALERT', 'Alerta de Convivencia'
    GENERAL = 'GENERAL', 'Mensaje General'

class ChannelChoices(models.TextChoices):
    SMS = 'SMS', 'Mensaje de Texto (SMS)'
    EMAIL = 'EMAIL', 'Correo Electrónico'
    IN_APP = 'IN_APP', 'Notificación en Plataforma'

class NotificationStatusChoices(models.TextChoices):
    PENDING = 'PENDING', 'Pendiente de Envío'
    SENT = 'SENT', 'Enviado con Éxito'
    FAILED = 'FAILED', 'Error de Envío'

class Notification(TimeStampedModel):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications_received',
        verbose_name="Destinatario"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications_sent',
        verbose_name="Remitente (Opcional)"
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationTypeChoices.choices,
        default=NotificationTypeChoices.GENERAL,
        verbose_name="Tipo de Notificación"
    )
    channel = models.CharField(
        max_length=20,
        choices=ChannelChoices.choices,
        default=ChannelChoices.IN_APP,
        verbose_name="Canal de Envío"
    )
    subject = models.CharField(max_length=200, blank=True, null=True, verbose_name="Asunto")
    content = models.TextField(verbose_name="Contenido")
    status = models.CharField(
        max_length=20,
        choices=NotificationStatusChoices.choices,
        default=NotificationStatusChoices.PENDING,
        verbose_name="Estado del Envío"
    )
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name="Fecha real de envío")
    
    # Campo para adjuntar archivos si es necesario (ej. reporte pdf)
    attachment = models.FileField(upload_to='communications/attachments/', null=True, blank=True)

    class Meta:
        db_table = 'communications_notifications'
        verbose_name = 'Notificación Individual'
        verbose_name_plural = 'Notificaciones Individuales'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_notification_type_display()} para {self.recipient.email} vía {self.get_channel_display()}"
