from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from apps.auth_users.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'is_active')
        read_only_fields = ('id', 'email', 'role', 'is_active')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get(self.username_field)
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed(
                'El correo electrónico ingresado no está registrado.',
                code='user_not_found'
            )

        if not user.is_active:
            raise AuthenticationFailed(
                'Tu cuenta está inactiva o bloqueada. Contacta al administrador.',
                code='user_inactive'
            )

        if not user.check_password(password):
            raise AuthenticationFailed(
                'La contraseña ingresada es incorrecta.',
                code='incorrect_password'
            )

        data = super().validate(attrs)
        
        # Add extra user information to the token response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
        }
        return data
