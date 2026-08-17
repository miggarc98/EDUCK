from django.db import models
from django.conf import settings

class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    blood_type = models.CharField(max_length=10, blank=True, null=True)
    medical_notes = models.TextField(blank=True, null=True)
    
    # Guardian Info
    guardian_name = models.CharField(max_length=150, blank=True, null=True)
    guardian_relation = models.CharField(max_length=50, blank=True, null=True)
    guardian_phone = models.CharField(max_length=50, blank=True, null=True)
    guardian_email = models.EmailField(blank=True, null=True)

    class Meta:
        db_table = 'enrollment_student_profiles'
        verbose_name = 'Perfil de Estudiante'
        verbose_name_plural = 'Perfiles de Estudiantes'

    def __str__(self):
        return f"Perfil de {self.user.email}"


class StudentAcademicHistory(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='academic_history'
    )
    year = models.CharField(max_length=20, help_text="Año o ciclo lectivo (ej: 2026, 2026-1)")
    degree = models.CharField(max_length=50)
    course = models.ForeignKey(
        'curriculum.Course',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_constraint=False
    )

    class Meta:
        db_table = 'enrollment_student_academic_history'
        verbose_name = 'Historial Académico'
        verbose_name_plural = 'Historiales Académicos'
        unique_together = ('student', 'year')
        ordering = ['-year']

    def __str__(self):
        return f"{self.student.email} - {self.degree} ({self.year})"
