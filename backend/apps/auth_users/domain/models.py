from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserRole(models.TextChoices):
    SUPERADMIN = 'superadmin', 'Superadministrador'
    ADMIN = 'admin', 'Administrador'
    COORDINATOR = 'coordinator', 'Coordinador'
    TEACHER = 'teacher', 'Docente'
    STUDENT = 'student', 'Estudiante'
    PARENT = 'parent', 'Padre'

class EnrollmentStatus(models.TextChoices):
    PRE_ENROLLED = 'pre_enrolled', 'Prematriculado'
    ENROLLED = 'enrolled', 'Matriculado'
    WITHDRAWN = 'withdrawn', 'Retirado'
    GRADUATED = 'graduated', 'Graduado'

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El correo electrónico es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.SUPERADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.STUDENT
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    two_factor_secret = models.CharField(max_length=32, blank=True, null=True)
    two_factor_enabled = models.BooleanField(default=False)
    backup_codes = models.JSONField(default=list, blank=True)

    current_course = models.ForeignKey(
        'curriculum.Course',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
        db_constraint=False
    )
    current_degree = models.CharField(max_length=50, blank=True, null=True)
    enrollment_status = models.CharField(
        max_length=20,
        choices=EnrollmentStatus.choices,
        blank=True,
        null=True
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'auth_users'

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        # Set default enrollment status for student if not set
        if self.role == UserRole.STUDENT and not self.enrollment_status:
            self.enrollment_status = EnrollmentStatus.PRE_ENROLLED
            
        super().save(*args, **kwargs)
        
        # Save academic history for the active academic year if student
        if self.role == UserRole.STUDENT and self.current_degree:
            from apps.institution.domain.models import InstitutionSetting
            from apps.enrollment.domain.models import StudentAcademicHistory
            try:
                academic_year = InstitutionSetting.get_solo().academic_year
                StudentAcademicHistory.objects.update_or_create(
                    student=self,
                    year=academic_year,
                    defaults={
                        'degree': self.current_degree,
                        'course': self.current_course
                    }
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error updating academic history for student {self.email}: {e}")
