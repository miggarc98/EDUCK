import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.platform_admin.models import Tenant, Domain
from apps.auth_users.models import User, UserRole
from django_tenants.utils import schema_context

def create_tenant_and_users(schema_name, tenant_name, domain_name, users_data):
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

    # 3. Create users inside the tenant's schema
    with schema_context(schema_name):
        for email, password, first_name, last_name, role in users_data:
            if User.objects.filter(email=email).exists():
                print(f"  ⚠️  El usuario {email} ya existe en {schema_name}")
            else:
                User.objects.create_user(
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    role=role
                )
                print(f"  ✅ Usuario creado en {schema_name}: {email} ({role})")

        # Create test courses/groups for each degree
        from apps.curriculum.domain.models import Course
        import random
        teachers = list(User.objects.filter(role=UserRole.TEACHER))
        if teachers:
            degrees_by_level = {
                "Preescolar": ["Pre-Jardín", "Jardín", "Transición"],
                "Básica Primaria": ["1º", "2º", "3º", "4º", "5º"],
                "Básica Secundaria": ["6º", "7º", "8º", "9º"],
                "Media Académica": ["10º", "11º"]
            }
            for level, degrees in degrees_by_level.items():
                for deg in degrees:
                    for section in ["A", "B"]:
                        course_name = f"Grado {deg}{section}"
                        course, c_created = Course.objects.get_or_create(
                            name=course_name,
                            defaults={
                                'level': level,
                                'degree': deg,
                                'director': random.choice(teachers)
                            }
                        )
                        if c_created:
                            print(f"    ✅ Curso creado en {schema_name}: {course_name} (Director: {course.director.email})")
                        else:
                            if not course.director and teachers:
                                course.director = random.choice(teachers)
                                course.save()
                                print(f"    🔄 Curso actualizado con director en {schema_name}: {course_name} (Director: {course.director.email})")
                            else:
                                print(f"    ⚠️  El curso {course_name} ya existe en {schema_name}")

            # Assign students to courses randomly and create StudentProfile
            from apps.enrollment.domain.models import StudentProfile
            import datetime
            import re

            students = list(User.objects.filter(role=UserRole.STUDENT))
            courses_list = list(Course.objects.all())
            blood_types = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
            med_notes = [
                'Alérgico a la penicilina. Asma leve.',
                'Ninguna conocida.',
                'Intolerancia a la lactosa.',
                'Ninguna conocida. Usa gafas formuladas.',
                'Usa inhalador para asma.'
            ]
            relations = ['Madre', 'Padre', 'Tía', 'Tío', 'Abuela', 'Abuelo']
            g_first_names = ['María', 'Carlos', 'Ana', 'Pedro', 'Rosa', 'Luis', 'Sofía', 'Jorge']
            g_last_names = ['Pérez', 'García', 'López', 'Rodríguez', 'Sánchez', 'Gómez']

            if students and courses_list:
                for idx, student in enumerate(students):
                    assigned_course = random.choice(courses_list)
                    student.current_course = assigned_course
                    student.current_degree = assigned_course.degree
                    student.save()

                    # Calculate age based on degree
                    deg = assigned_course.degree or "6º"
                    match = re.search(r'\d+', deg)
                    if match:
                        grade_num = int(match.group())
                        age = grade_num + 5
                    else:
                        age = 5 # Pre-Jardín, Jardín, Transición
                    
                    birth_year = 2026 - age # Current year is 2026 based on metadata
                    birth_date = datetime.date(birth_year, 1, 1)

                    # Create or update StudentProfile
                    StudentProfile.objects.update_or_create(
                        user=student,
                        defaults={
                            'phone': f"+57 300 {100 + (idx % 100):03d} {4567 + idx:04d}",
                            'address': f"Calle {idx + 1} #{45 + (idx % 50)}-{67 + (idx % 30)}, Bogotá",
                            'birth_date': birth_date,
                            'blood_type': random.choice(blood_types),
                            'medical_notes': random.choice(med_notes),
                            'guardian_name': f"{random.choice(g_first_names)} {random.choice(g_last_names)}",
                            'guardian_relation': random.choice(relations),
                            'guardian_phone': f"+57 310 {987 - (idx % 100):03d} {6543 - idx:04d}",
                            'guardian_email': f"acudiente.{student.id}@ejemplo.com"
                        }
                    )
                print(f"    ✅ {len(students)} estudiantes asignados a cursos y con perfiles creados en {schema_name}")

def main():
    try:
        # Create public tenant
        public_tenant, created = Tenant.objects.get_or_create(
            schema_name='public',
            defaults={'name': 'Public Tenant'}
        )
        if created:
            print("✅ Tenant público creado")
        
        public_domain, d_created = Domain.objects.get_or_create(
            domain='localhost',
            defaults={'tenant': public_tenant, 'is_primary': True}
        )
        if d_created:
            print("✅ Dominio localhost para public creado")

        # Institution A
        users_a = [
            ('superadmin.a@colegioa.edu.co', 'password123', 'Super', 'Admin A', UserRole.SUPERADMIN),
            ('admin.a@colegioa.edu.co', 'password123', 'Ana', 'Martinez', UserRole.ADMIN),
            ('coordinador.a@colegioa.edu.co', 'password123', 'Carlos', 'Gomez', UserRole.COORDINATOR),
            ('docente.a@colegioa.edu.co', 'password123', 'Maria', 'Rodriguez', UserRole.TEACHER),
            ('padre.a@colegioa.edu.co', 'password123', 'Pedro', 'Acosta', UserRole.PARENT),
        ]
        
        first_names = ['Juan', 'Maria', 'Pedro', 'Ana', 'Luis', 'Sofia', 'Carlos', 'Laura', 'Diego', 'Lucia', 'Jose', 'Elena']
        last_names = ['Gomez', 'Rodriguez', 'Martinez', 'Garcia', 'Lopez', 'Perez', 'Sanchez', 'Gonzalez', 'Fernandez', 'Torres']
        # Generate other roles (teachers, coordinators, parents)
        roles = [UserRole.TEACHER, UserRole.PARENT, UserRole.COORDINATOR]
        for i in range(1, 61):
            fn = first_names[i % len(first_names)]
            ln = last_names[i % len(last_names)]
            role = roles[i % len(roles)]
            users_a.append((f"user.a.{i}@colegioa.edu.co", "password123", f"{fn} {i}", ln, role))

        # Generate 200 explicit students for Colegio A
        for i in range(1, 201):
            fn = first_names[i % len(first_names)]
            ln = last_names[i % len(last_names)]
            users_a.append((f"student.a.{i}@colegioa.edu.co", "password123", f"Estudiante A{i}", f"{ln} {fn}", UserRole.STUDENT))

        create_tenant_and_users('inst_a', 'Colegio A', 'colegioa.localhost', users_a)

        # Institution B
        users_b = [
            ('superadmin.b@colegiob.edu.co', 'password123', 'Super', 'Admin B', UserRole.SUPERADMIN),
            ('admin.b@colegiob.edu.co', 'password123', 'Beatriz', 'Ruiz', UserRole.ADMIN),
            ('coordinador.b@colegiob.edu.co', 'password123', 'Andres', 'Perez', UserRole.COORDINATOR),
            ('estudiante.b@colegiob.edu.co', 'password123', 'Juan', 'Castro', UserRole.STUDENT),
            ('padre.b@colegiob.edu.co', 'password123', 'Patricia', 'Suarez', UserRole.PARENT),
        ]

        # Generate other roles for Colegio B
        for i in range(1, 61):
            fn = first_names[i % len(first_names)]
            ln = last_names[i % len(last_names)]
            role = roles[i % len(roles)]
            users_b.append((f"user.b.{i}@colegiob.edu.co", "password123", f"{fn} {i}", ln, role))

        # Generate 200 explicit students for Colegio B
        for i in range(1, 201):
            fn = first_names[i % len(first_names)]
            ln = last_names[i % len(last_names)]
            users_b.append((f"student.b.{i}@colegiob.edu.co", "password123", f"Estudiante B{i}", f"{ln} {fn}", UserRole.STUDENT))

        create_tenant_and_users('inst_b', 'Colegio B', 'colegiob.localhost', users_b)

        print("\n🎉 ¡Datos de prueba generados con éxito!")
    except Exception as e:
        print(f"❌ Error al crear datos de prueba: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
