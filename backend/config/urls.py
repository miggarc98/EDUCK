from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.auth_users.api.urls')),
    path('api/institution/', include('apps.institution.api.urls')),
    path('api/curriculum/', include('apps.curriculum.api.urls')),
    path('api/enrollment/', include('apps.enrollment.api.urls')),
    path('api/core/', include('apps.core.api.urls')),
    path('api/academics/', include('apps.academics.api.urls')),
]

