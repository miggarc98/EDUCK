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
        roles = [UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT, UserRole.COORDINATOR]

        for i in range(1, 121):
            fn = first_names[i % len(first_names)]
            ln = last_names[i % len(last_names)]
            role = roles[i % len(roles)]
            users_a.append((f"user.a.{i}@colegioa.edu.co", "password123", f"{fn} {i}", ln, role))

        create_tenant_and_users('inst_a', 'Colegio A', 'colegioa.localhost', users_a)

        # Institution B
        users_b = [
            ('superadmin.b@colegiob.edu.co', 'password123', 'Super', 'Admin B', UserRole.SUPERADMIN),
            ('admin.b@colegiob.edu.co', 'password123', 'Beatriz', 'Ruiz', UserRole.ADMIN),
            ('coordinador.b@colegiob.edu.co', 'password123', 'Andres', 'Perez', UserRole.COORDINATOR),
            ('estudiante.b@colegiob.edu.co', 'password123', 'Juan', 'Castro', UserRole.STUDENT),
            ('padre.b@colegiob.edu.co', 'password123', 'Patricia', 'Suarez', UserRole.PARENT),
        ]

        for i in range(1, 121):
            fn = first_names[i % len(first_names)]
            ln = last_names[i % len(last_names)]
            role = roles[i % len(roles)]
            users_b.append((f"user.b.{i}@colegiob.edu.co", "password123", f"{fn} {i}", ln, role))

        create_tenant_and_users('inst_b', 'Colegio B', 'colegiob.localhost', users_b)

        print("\n🎉 ¡Datos de prueba generados con éxito!")
    except Exception as e:
        print(f"❌ Error al crear datos de prueba: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
