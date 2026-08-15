from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.academics.api.views import TeacherViewSet, ClassScheduleViewSet

router = DefaultRouter()
router.register('teachers', TeacherViewSet, basename='teachers')
router.register('schedules', ClassScheduleViewSet, basename='schedules')

urlpatterns = [
    path('', include(router.urls)),
]
