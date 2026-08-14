from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.academics.api.views import TeacherViewSet

router = DefaultRouter()
router.register('teachers', TeacherViewSet, basename='teachers')

urlpatterns = [
    path('', include(router.urls)),
]
