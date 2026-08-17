from django.db import models
from django.conf import settings
import re

class TeacherProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='teacher_profile'
    )
    employee_id = models.CharField(max_length=50, unique=True, blank=True)
    area = models.CharField(max_length=100, blank=True)
    additional_areas = models.JSONField(default=list, blank=True, help_text="Áreas secundarias que puede dictar")
    max_hours = models.PositiveIntegerField(default=22, help_text="Límite de horas semanales permitidas")
    academic_load = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=[('active', 'Activo'), ('on_leave', 'En Licencia')],
        default='active'
    )
    available_shifts = models.JSONField(default=list, blank=True, help_text="Jornadas disponibles (ej. ['Mañana', 'Tarde'])")
    availability = models.JSONField(default=dict, blank=True, help_text="Disponibilidad horaria por día")

    class Meta:
        db_table = 'academics_teacher_profiles'
        verbose_name = 'Perfil de Docente'
        verbose_name_plural = 'Perfiles de Docentes'

    def save(self, *args, **kwargs):
        if not self.employee_id:
            max_id = 0
            profiles = TeacherProfile.objects.filter(employee_id__startswith='DOC-')
            for p in profiles:
                match = re.search(r'DOC-(\d+)', p.employee_id)
                if match:
                    val = int(match.group(1))
                    if val > max_id:
                        max_id = val
            self.employee_id = f"DOC-{max_id + 1:03d}"
        super().save(*args, **kwargs)

class ClassSchedule(models.Model):
    course = models.ForeignKey(
        'curriculum.Course',
        on_delete=models.CASCADE,
        related_name='schedules',
        help_text="Curso asignado"
    )
    day = models.CharField(
        max_length=20,
        choices=[
            ('Lunes', 'Lunes'),
            ('Martes', 'Martes'),
            ('Miércoles', 'Miércoles'),
            ('Jueves', 'Jueves'),
            ('Viernes', 'Viernes'),
            ('Sábado', 'Sábado'),
            ('Domingo', 'Domingo')
        ]
    )
    time_slot = models.CharField(max_length=50, help_text="Rango de hora (ej: 07:00 - 08:00)")
    subject = models.ForeignKey(
        'curriculum.Subject',
        on_delete=models.CASCADE,
        related_name='schedules',
        help_text="Asignatura dictada"
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='schedules',
        help_text="Docente que dicta la clase"
    )
    room = models.CharField(max_length=100, blank=True, default='', help_text="Lugar/Aula (ej: Aula 101)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'academics_class_schedules'
        verbose_name = 'Horario de Clase'
        verbose_name_plural = 'Horarios de Clases'
        unique_together = ('course', 'day', 'time_slot')

    def __str__(self):
        return f"{self.course} - {self.day} {self.time_slot}: {self.subject} ({self.room})"

