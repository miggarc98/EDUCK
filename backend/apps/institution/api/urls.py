from django.urls import path
from apps.institution.api.views import InstitutionSettingView

urlpatterns = [
    path('settings/', InstitutionSettingView.as_view(), name='institution-settings'),
]
