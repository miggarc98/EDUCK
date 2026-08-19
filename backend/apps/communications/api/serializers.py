from rest_framework import serializers
from apps.communications.models import Announcement, Notification

class AnnouncementSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    audience_type_display = serializers.CharField(source='get_audience_type_display', read_only=True)

    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ('sender',)

class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    channel_display = serializers.CharField(source='get_channel_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('sender', 'status', 'sent_at')
