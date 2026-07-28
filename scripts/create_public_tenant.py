
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.platform_admin.models import Tenant, Domain

try:
    # Verificar si ya existe el tenant público
    if Tenant.objects.filter(schema_name='public').exists():
        print("⚠️  El tenant público ya existe")
        tenant = Tenant.objects.get(schema_name='public')
    else:
        # Crear tenant público
        tenant = Tenant.objects.create(
            schema_name='public',
            name='Public Tenant'
        )
        print(f"✅ Tenant creado: {tenant.schema_name} (ID: {tenant.id})")

    # Verificar si ya existe el dominio localhost
    if Domain.objects.filter(domain='localhost').exists():
        print("⚠️  El dominio localhost ya existe")
    else:
        # Crear dominio
        Domain.objects.create(
            domain='localhost',
            tenant=tenant,
            is_primary=True
        )
        print(f"✅ Dominio creado: localhost")

    print("\n🎉 ¡Todo listo! Ya puedes acceder a http://localhost:8000/")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

# Ejecutar el script
# docker exec -it educk_api python create_public_tenant.py