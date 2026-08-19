from rest_framework import viewsets, permissions
from apps.communications.models import Announcement, Notification
from apps.communications.api.serializers import AnnouncementSerializer, NotificationSerializer
from apps.communications.tasks import send_notification

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all().order_by('-created_at')
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        notification = serializer.save(sender=self.request.user)
        # Lanzar la tarea de Celery en background para procesar "Dejen de Fregar" y envío
        send_notification.delay(
            user_id=notification.recipient.id,
            message_type=notification.notification_type,
            content=notification.content
        )
