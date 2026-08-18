from django.db import models
from apps.core.domain.models import TimeStampedModel
from encrypted_model_fields.fields import EncryptedCharField, EncryptedTextField
from auditlog.registry import auditlog

class PIARDocument(TimeStampedModel):
    """
    Plan Individual de Ajustes Razonables (PIAR)
    Cumple con el Decreto 1421 de 2017.
    """
    student_id = models.UUIDField() # ID of the student
    teacher_id = models.UUIDField() # ID of the teacher who created it
    
    # Datos Pedagógicos (Públicos para docentes)
    pedagogical_strategies = models.TextField(blank=True, help_text="Ajustes y estrategias en el aula")
    learning_rhythm = models.CharField(max_length=255, blank=True)
    
    # Datos Clínicos/Sensibles (Encriptados en DB, acceso restringido)
    medical_diagnosis = EncryptedCharField(max_length=255, blank=True, help_text="Diagnóstico médico formal (Dato Sensible)")
    clinical_history_notes = EncryptedTextField(blank=True, help_text="Notas clínicas anexas (Dato Sensible)")
    
    class Meta:
        db_table = 'support_help_piar'
        verbose_name = 'PIAR'
        verbose_name_plural = 'PIARs'

    def __str__(self):
        return f"PIAR para estudiante {self.student_id}"

# Registrar modelo en auditlog
auditlog.register(PIARDocument)
