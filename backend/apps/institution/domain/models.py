from django.db import models

def default_level_scales():
    return {
        "preescolar": "Cualitativa (E / S / A / I)",
        "primaria": "1.0 - 5.0 (Numérica)",
        "secundaria": "1.0 - 5.0 (Numérica)",
        "media": "1.0 - 5.0 (Numérica)"
    }

def default_offered_degrees():
    return {
        "preescolar": ["Pre-Jardín", "Jardín", "Transición"],
        "primaria": ["1º", "2º", "3º", "4º", "5º"],
        "secundaria": ["6º", "7º", "8º", "9º"],
        "media": ["10º", "11º"]
    }

def default_settings_json():
    return {
        "notifications": {
            "behavior_alerts": True,
            "system_notices": True,
            "weekly_report": False
        }
    }

from apps.core.domain.models import TimeStampedModel

class InstitutionSetting(TimeStampedModel):
    """
    Modelo de configuración privada de la institución educativa para el tenant activo.
    Mantiene una única instancia (Singleton) por esquema/tenant.
    """
    name = models.CharField(max_length=255, default='Institución Educativa Educk')
    dane_nit = models.CharField(max_length=100, blank=True, default='')
    address = models.CharField(max_length=255, blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    logo_url = models.TextField(blank=True, default='')
    is_formal_education = models.BooleanField(default=True, help_text="Educación Formal Ley 115 / PEI")


    # Configuración académica
    academic_year = models.CharField(max_length=20, default='2026')
    active_period = models.CharField(max_length=50, default='1er Periodo')
    start_time = models.CharField(max_length=10, default='07:00')
    end_time = models.CharField(max_length=10, default='14:30')
    shifts = models.JSONField(
        default=list, 
        blank=True, 
        help_text="Lista de jornadas con sus horarios. Ej: [{'name': 'Mañana', 'start_time': '07:00', 'end_time': '12:30'}]"
    )
    block_duration_minutes = models.IntegerField(default=45)
    default_teacher_max_hours = models.IntegerField(default=22, help_text="Límite máximo de horas semanal predeterminado por docente")

    # Escala de calificaciones
    general_scale = models.CharField(max_length=100, default='1.0 - 5.0 (Numérica)')
    decimal_precision = models.IntegerField(default=1)
    min_passing_grade = models.DecimalField(max_digits=4, decimal_places=2, default=3.0)
    independent_scale_per_level = models.BooleanField(default=False)
    level_scales = models.JSONField(default=default_level_scales, blank=True)

    # Grados y niveles ofertados
    offered_degrees = models.JSONField(default=default_offered_degrees, blank=True)

    # Configuración extendida en formato JSON para máxima flexibilidad
    settings_json = models.JSONField(default=default_settings_json, blank=True)

    class Meta:
        db_table = 'institution_settings'
        verbose_name = 'Configuración de Institución'
        verbose_name_plural = 'Configuraciones de Instituciones'

    def __str__(self):
        return f"Configuración - {self.name}"

    @classmethod
    def get_solo(cls):
        """
        Garantiza que exista una única fila de configuración por esquema de institución.
        """
        obj, created = cls.objects.get_or_create(id=1)
        return obj
