from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.auth_users.api.urls')),
    path('api/institution/', include('apps.institution.api.urls')),
    path('api/core/', include('apps.core.api.urls')),
]

