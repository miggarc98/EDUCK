from django.db import models
from django.conf import settings
from apps.core.domain.models import TimeStampedModel

class FaultTypeChoices(models.TextChoices):
    TIPO_I = 'TIPO_I', 'Tipo I (Faltas Leves)'
    TIPO_II = 'TIPO_II', 'Tipo II (Faltas Graves)'
    TIPO_III = 'TIPO_III', 'Tipo III (Delitos/Extremadamente Graves)'

class BehaviorRule(TimeStampedModel):
    name = models.CharField(max_length=200, verbose_name="Nombre de la falta")
    description = models.TextField(verbose_name="Descripción")
    fault_type = models.CharField(
        max_length=20,
        choices=FaultTypeChoices.choices,
        verbose_name="Clasificación Ley 1620"
    )

    class Meta:
        db_table = 'behavior_rules'
        verbose_name = 'Norma de Convivencia'
        verbose_name_plural = 'Normas de Convivencia'

    def __str__(self):
        return f"{self.name} ({self.get_fault_type_display()})"

class IncidentStatusChoices(models.TextChoices):
    OPEN = 'OPEN', 'Abierto'
    IN_PROGRESS = 'IN_PROGRESS', 'En Proceso'
    RESOLVED = 'RESOLVED', 'Resuelto'
    CLOSED = 'CLOSED', 'Cerrado'

class IncidentReport(TimeStampedModel):
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='reported_incidents',
        verbose_name="Reportado por"
    )
    incident_date = models.DateTimeField(verbose_name="Fecha y hora del incidente")
    location = models.CharField(max_length=255, verbose_name="Lugar del incidente")
    description = models.TextField(verbose_name="Descripción detallada")
    status = models.CharField(
        max_length=20,
        choices=IncidentStatusChoices.choices,
        default=IncidentStatusChoices.OPEN,
        verbose_name="Estado del caso"
    )

    class Meta:
        db_table = 'behavior_incident_reports'
        verbose_name = 'Reporte de Incidencia'
        verbose_name_plural = 'Reportes de Incidencias'
        ordering = ['-incident_date']

    def __str__(self):
        return f"Incidente {self.id} - {self.incident_date.strftime('%Y-%m-%d')} - {self.get_status_display()}"

class RoleChoices(models.TextChoices):
    PRESUMED_AGGRESSOR = 'PRESUMED_AGGRESSOR', 'Presunto Agresor'
    VICTIM = 'VICTIM', 'Víctima'
    WITNESS = 'WITNESS', 'Testigo'
    OTHER = 'OTHER', 'Otro'

class IncidentInvolvement(TimeStampedModel):
    incident = models.ForeignKey(
        IncidentReport,
        on_delete=models.CASCADE,
        related_name='involvements',
        verbose_name="Incidente"
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='behavior_involvements',
        verbose_name="Estudiante"
    )
    role = models.CharField(
        max_length=30,
        choices=RoleChoices.choices,
        verbose_name="Rol en el incidente"
    )
    rule_broken = models.ForeignKey(
        BehaviorRule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Norma infringida"
    )
    student_statement = models.TextField(
        blank=True,
        verbose_name="Descargos del estudiante"
    )

    class Meta:
        db_table = 'behavior_incident_involvements'
        verbose_name = 'Involucrado en Incidente'
        verbose_name_plural = 'Involucrados en Incidentes'
        unique_together = ('incident', 'student')

    def __str__(self):
        return f"{self.student.email} - {self.get_role_display()} en Incidente {self.incident.id}"

class ActionTypeChoices(models.TextChoices):
    VERBAL_WARNING = 'VERBAL_WARNING', 'Llamado de atención verbal'
    WRITTEN_WARNING = 'WRITTEN_WARNING', 'Llamado de atención escrito'
    PARENT_MEETING = 'PARENT_MEETING', 'Citación a acudiente'
    COMMITMENT_ACT = 'COMMITMENT_ACT', 'Acta de compromiso'
    SUSPENSION = 'SUSPENSION', 'Suspensión'
    EXTERNAL_REFERRAL = 'EXTERNAL_REFERRAL', 'Remisión a entidad externa (ICBF, Policía)'

class DisciplinaryAction(TimeStampedModel):
    incident = models.ForeignKey(
        IncidentReport,
        on_delete=models.CASCADE,
        related_name='actions',
        verbose_name="Incidente"
    )
    action_type = models.CharField(
        max_length=30,
        choices=ActionTypeChoices.choices,
        verbose_name="Tipo de Acción"
    )
    description = models.TextField(verbose_name="Descripción y conclusiones")
    document_file = models.FileField(
        upload_to='behavior/actions/',
        blank=True,
        null=True,
        verbose_name="Documento adjunto (PDF)"
    )
    responsible = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='disciplinary_actions_managed',
        verbose_name="Responsable de la acción"
    )

    class Meta:
        db_table = 'behavior_disciplinary_actions'
        verbose_name = 'Acción Disciplinaria'
        verbose_name_plural = 'Acciones Disciplinarias'

    def __str__(self):
        return f"{self.get_action_type_display()} - Incidente {self.incident.id}"
