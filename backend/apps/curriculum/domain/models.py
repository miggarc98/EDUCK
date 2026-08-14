from django.db import models
from django.conf import settings

class Course(models.Model):
    name = models.CharField(max_length=100, help_text="Nombre del curso/grupo (ej: Grado 6A, Sexto uno)")
    level = models.CharField(max_length=100, help_text="Nivel académico (ej: Básica Secundaria, Media Académica)")
    degree = models.CharField(max_length=50, blank=True, null=True, help_text="Grado académico (ej: 6º, 7º)")
    director = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="directed_courses",
        help_text="Director de grupo"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'curriculum_courses'
        verbose_name = 'Curso'
        verbose_name_plural = 'Cursos'

    def __str__(self):
        return self.name
