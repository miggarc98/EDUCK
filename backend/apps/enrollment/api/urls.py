from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.enrollment.api.views import StudentViewSet

router = DefaultRouter()
router.register('students', StudentViewSet, basename='student')

urlpatterns = [
    path('', include(router.urls)),
]
