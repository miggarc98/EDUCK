import os
import django
import sys
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.platform_admin.models import Tenant, Domain
from apps.auth_users.models import User, UserRole
from django_tenants.utils import schema_context

def get_base_users(prefix):
    return [
        (f'superadmin.{prefix}@colegio{prefix}.edu.co', 'password123', 'Super', f'Admin {prefix.upper()}', UserRole.SUPERADMIN),
        (f'admin.{prefix}@colegio{prefix}.edu.co', 'password123', 'Admin', f'General {prefix.upper()}', UserRole.ADMIN),
        (f'coordinador.{prefix}@colegio{prefix}.edu.co', 'password123', 'Coordinador', f'Academico {prefix.upper()}', UserRole.COORDINATOR),
        (f'padre.{prefix}@colegio{prefix}.edu.co', 'password123', 'Padre', f'Familia {prefix.upper()}', UserRole.PARENT),
    ]

# The Departments and Teachers spec
DEPARTMENTS_SPEC = [
    {
        "departamento": "Preescolar",
        "cantidad_docentes": 6,
        "asignaturas": ["Dimensiones del Desarrollo"]
    },
    {
        "departamento": "Matemáticas",
        "cantidad_docentes": 6,
        "asignaturas": ["Matemáticas", "Trigonometría (10º)", "Cálculo (11º)"]
    },
    {
        "departamento": "Humanidades e Idiomas",
        "cantidad_docentes": 8,
        "asignaturas": ["Lengua Castellana", "Literatura", "Idioma Extranjero (Inglés)"]
    },
    {
        "departamento": "Ciencias Naturales",
        "cantidad_docentes": 5,
        "asignaturas": ["Ciencias Naturales y Educación Ambiental", "Biología (Media)", "Física (Media)", "Química (Media)"]
    },
    {
        "departamento": "Ciencias Sociales",
        "cantidad_docentes": 5,
        "asignaturas": ["Ciencias Sociales", "Ciencias Económicas y Políticas (Media)", "Filosofía (Media)"]
    },
    {
        "departamento": "Educación Artística",
        "cantidad_docentes": 2,
        "asignaturas": ["Educación Artística"]
    },
    {
        "departamento": "Educación Física",
        "cantidad_docentes": 2,
        "asignaturas": ["Educación Física, Recreación y Deportes"]
    },
    {
        "departamento": "Tecnología e Informática",
        "cantidad_docentes": 2,
        "asignaturas": ["Tecnología e Informática"]
    },
    {
        "departamento": "Ética y Religión",
        "cantidad_docentes": 2,
        "asignaturas": ["Educación Ética y Valores Humanos", "Educación Religiosa"]
    }
]

# The Courses Spec
DEGREES_BY_LEVEL = {
    "Preescolar": ["Pre-Jardín A", "Pre-Jardín B", "Jardín A", "Jardín B", "Transición A", "Transición B"],
    "Básica Primaria": ["1ºA", "1ºB", "2ºA", "2ºB", "3ºA", "3ºB", "4ºA", "4ºB", "5ºA", "5ºB"],
    "Básica Secundaria": ["6ºA", "6ºB", "7ºA", "7ºB", "8ºA", "8ºB", "9ºA", "9ºB"],
    "Media Académica": ["10ºA", "10ºB", "11ºA", "11ºB"]
}

FIRST_NAMES = ['Juan', 'Maria', 'Pedro', 'Ana', 'Luis', 'Sofia', 'Carlos', 'Laura', 'Diego', 'Lucia', 'Jose', 'Elena', 'Fernando', 'Isabella', 'Miguel', 'Valentina', 'Andres', 'Camila']
LAST_NAMES = ['Gomez', 'Rodriguez', 'Martinez', 'Garcia', 'Lopez', 'Perez', 'Sanchez', 'Gonzalez', 'Fernandez', 'Torres', 'Ramirez', 'Alvarez', 'Ruiz', 'Suarez']

def create_tenant_and_data(schema_name, tenant_name, domain_name, prefix):
    # 1. Create or get Tenant
    tenant, created = Tenant.objects.get_or_create(
        schema_name=schema_name,
        defaults={'name': tenant_name}
    )
    if created:
        print(f"✅ Tenant creado: {tenant_name} ({schema_name})")
    else:
        print(f"⚠️  El tenant {tenant_name} ({schema_name}) ya existe")

    # 2. Create or get Domain
    domain, d_created = Domain.objects.get_or_create(
        domain=domain_name,
        defaults={'tenant': tenant, 'is_primary': True}
    )
    if d_created:
        print(f"✅ Dominio creado: {domain_name}")
    else:
        print(f"⚠️  El dominio {domain_name} ya existe")

    # 3. Create users and data inside the tenant's schema
    with schema_context(schema_name):
        users_to_create = get_base_users(prefix)

        # Create students (generate 200)
        for i in range(1, 201):
            fn = FIRST_NAMES[i % len(FIRST_NAMES)]
            ln = LAST_NAMES[i % len(LAST_NAMES)]
            users_to_create.append((f"student.{prefix}.{i}@colegio{prefix}.edu.co", "password123", f"{fn}", f"{ln}", UserRole.STUDENT))

        for email, password, first_name, last_name, role in users_to_create:
            if not User.objects.filter(email=email).exists():
                User.objects.create_user(email=email, password=password, first_name=first_name, last_name=last_name, role=role)

        print(f"  ✅ Usuarios base y estudiantes creados en {schema_name}")

        # Delete existing data to recreate perfectly (optional but good for clean state)
        from apps.curriculum.domain.models import Area, Subject, Course
        from apps.academics.domain.models import TeacherProfile
        from apps.institution.domain.models import InstitutionSetting
        from apps.enrollment.domain.models import StudentProfile
        import datetime
        import random
        import re
        
        # Configure Institution Shifts
        setting = InstitutionSetting.get_solo()
        setting.shifts = [
            {"id": "manana", "name": "Mañana", "start_time": "06:30", "end_time": "12:30"},
            {"id": "tarde", "name": "Tarde", "start_time": "12:30", "end_time": "18:30"}
        ]
        setting.save()

        Area.objects.all().delete()
        Course.objects.all().delete()
        TeacherProfile.objects.all().delete()
        
        # We need to delete old teachers who might not match our exact 38
        User.objects.filter(role=UserRole.TEACHER).delete()

        # Now, create exactly 38 teachers according to Departments
        teacher_idx = 1
        all_teachers = []
        for dept in DEPARTMENTS_SPEC:
            dept_name = dept["departamento"]
            
            # Create Area
            area, _ = Area.objects.get_or_create(
                name=dept_name,
                defaults={'description': f"Departamento de {dept_name}", 'is_mandatory': True}
            )

            # Create Subjects
            for subj_name in dept["asignaturas"]:
                # set some default hours, preescolar usually has large block 27 hrs? we'll set 4 as default
                Subject.objects.get_or_create(
                    name=subj_name,
                    area=area,
                    defaults={'description': f"{subj_name}", 'weekly_hours': 4}
                )

            # Create exact number of teachers
            for i in range(dept["cantidad_docentes"]):
                fn = FIRST_NAMES[teacher_idx % len(FIRST_NAMES)]
                ln = LAST_NAMES[teacher_idx % len(LAST_NAMES)]
                # Sanitize email string
                clean_dept = dept_name.lower().replace(" ", "").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")
                email = f"docente.{prefix}.{clean_dept[:6]}{teacher_idx}@colegio{prefix}.edu.co"
                
                teacher_user, u_created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'first_name': fn,
                        'last_name': ln,
                        'role': UserRole.TEACHER
                    }
                )
                if u_created:
                    teacher_user.set_password('password123')
                    teacher_user.save()
                
                all_teachers.append(teacher_user)
                
                # Randomize available shifts for teachers to test the generator
                avail_shifts = random.choice([
                    ["manana"],
                    ["tarde"],
                    ["manana", "tarde"]
                ])
                
                TeacherProfile.objects.update_or_create(
                    user=teacher_user,
                    defaults={
                        'area': dept_name,
                        'max_hours': 22,
                        'academic_load': 0,
                        'status': 'active',
                        'available_shifts': avail_shifts
                    }
                )
                
                teacher_idx += 1

        print(f"    ✅ Creados 38 docentes y organizados por departamentos en {schema_name}")

        # Create Courses
        courses_list = []
        # Assign Preescolar and Primaria to Mañana, Secundaria and Media to Tarde
        for level, degree_list in DEGREES_BY_LEVEL.items():
            shift_id = "manana" if level in ["Preescolar", "Básica Primaria"] else "tarde"
            
            for deg_section in degree_list:
                if deg_section.endswith(('A', 'B')):
                    deg = deg_section[:-1].strip()
                    section = deg_section[-1]
                else:
                    deg = deg_section
                    section = ""
                
                course_name = deg_section
                
                # Assign a random director
                director = random.choice(all_teachers) if all_teachers else None
                
                course, c_created = Course.objects.update_or_create(
                    name=course_name,
                    defaults={
                        'level': level,
                        'degree': deg,
                        'director': director
                    }
                )
                courses_list.append(course)

        print(f"    ✅ Creados 28 cursos (Grados específicos) en {schema_name}")

        # Associate all subjects with their corresponding courses
        all_subjects = Subject.objects.all()
        for subj in all_subjects:
            valid_courses = []
            for c in courses_list:
                # Preescolar solo tiene "Dimensiones"
                if c.level == "Preescolar":
                    if "Dimensiones" in subj.name:
                        valid_courses.append(c)
                    continue
                
                # Las demás NO tienen Dimensiones
                if "Dimensiones" in subj.name:
                    continue
                
                # Check specifics
                if "(10º)" in subj.name and "10º" not in c.name: continue
                if "(11º)" in subj.name and "11º" not in c.name: continue
                if "(Media)" in subj.name and c.level != "Media Académica": continue
                
                valid_courses.append(c)
            
            subj.courses.set(valid_courses)

        print(f"    ✅ Asignaturas vinculadas a cursos en {schema_name}")

        # Students enrollment
        students = list(User.objects.filter(role=UserRole.STUDENT))
        blood_types = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
        med_notes = ['Alérgico a la penicilina.', 'Ninguna conocida.', 'Intolerancia a la lactosa.']
        relations = ['Madre', 'Padre', 'Tía', 'Abuela']
        
        for idx, student in enumerate(students):
            assigned_course = courses_list[idx % len(courses_list)]
            student.current_course = assigned_course
            student.current_degree = assigned_course.degree
            student.enrollment_status = 'enrolled'
            student.save()

            match = re.search(r'\d+', assigned_course.degree or "6º")
            age = int(match.group()) + 5 if match else 5
            birth_date = datetime.date(2026 - age, 1, 1)

            StudentProfile.objects.update_or_create(
                user=student,
                defaults={
                    'phone': f"+57 300 000 {1000 + idx}",
                    'address': f"Calle Test #{idx}",
                    'birth_date': birth_date,
                    'blood_type': random.choice(blood_types),
                    'medical_notes': random.choice(med_notes),
                    'guardian_name': f"Acudiente {idx}",
                    'guardian_relation': random.choice(relations),
                    'guardian_phone': f"+57 310 000 {1000 + idx}",
                    'guardian_email': f"acudiente.{student.id}@ejemplo.com"
                }
            )

        print(f"    ✅ Estudiantes matriculados a los 28 cursos en {schema_name}")

def main():
    try:
        # Create public tenant
        public_tenant, created = Tenant.objects.get_or_create(
            schema_name='public',
            defaults={'name': 'Public Tenant'}
        )
        if created:
            print("✅ Tenant público creado")
        
        Domain.objects.get_or_create(
            domain='localhost',
            defaults={'tenant': public_tenant, 'is_primary': True}
        )

        create_tenant_and_data('inst_a', 'Escenario Educk A', 'colegioa.localhost', 'a')
        create_tenant_and_data('inst_b', 'Escenario Educk B', 'colegiob.localhost', 'b')

        print("\n🎉 ¡Datos de prueba generados con éxito!")
    except Exception as e:
        print(f"❌ Error al crear datos de prueba: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
