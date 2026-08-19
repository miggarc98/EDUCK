from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.communications.api.views import AnnouncementViewSet, NotificationViewSet

router = DefaultRouter()
router.register('announcements', AnnouncementViewSet, basename='announcements')
router.register('notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),
]
