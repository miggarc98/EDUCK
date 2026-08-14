from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.curriculum.api.views import CourseViewSet

router = DefaultRouter()
router.register('courses', CourseViewSet, basename='course')

urlpatterns = [
    path('', include(router.urls)),
]
