from django.db import models
from django_tenants.models import TenantMixin, DomainMixin

class Tenant(TenantMixin):
    name = models.CharField(max_length=100)
    created_on = models.DateField(auto_now_add=True)

    # El esquema por defecto 'public' será el tenant principal
    auto_create_schema = True

class Domain(DomainMixin):
    pass
