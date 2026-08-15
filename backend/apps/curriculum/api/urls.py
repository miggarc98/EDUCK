from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.curriculum.api.views import CourseViewSet, AreaViewSet, SubjectViewSet

router = DefaultRouter()
router.register('courses', CourseViewSet, basename='course')
router.register('areas', AreaViewSet, basename='area')
router.register('subjects', SubjectViewSet, basename='subject')

urlpatterns = [
    path('', include(router.urls)),
]

