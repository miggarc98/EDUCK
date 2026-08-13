import os
import pyotp
import random
import string
from django.core import signing
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from apps.auth_users.api.serializers import CustomTokenObtainPairSerializer, UserSerializer
from apps.auth_users.models import User
from apps.auth_users.utils import generate_qr_code_base64

def check_dev_mode():
    return os.environ.get('TWO_FACTOR_DEV_MODE', 'False').lower() in ('true', '1', 't')

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        # Primero validamos credenciales normales de usuario
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            raise e

        user = serializer.user

        # El 2FA es obligatorio para admin y superadmin
        if user.role in ['superadmin', 'admin']:
            # Generar token temporal firmado por 5 minutos
            temp_token = signing.dumps(
                {'user_id': user.id, 'purpose': '2fa_verification'},
                salt='2fa-auth',
                compress=True
            )

            if not user.two_factor_enabled:
                # Si no tiene el secreto TOTP generado, lo creamos
                if not user.two_factor_secret:
                    user.two_factor_secret = pyotp.random_base32()
                    user.save()

                # Generar provisioning URI y QR Code
                host = request.get_host().split(':')[0]
                provisioning_uri = pyotp.totp.TOTP(user.two_factor_secret).provisioning_uri(
                    name=user.email,
                    issuer_name=f"Educk ({host})"
                )
                qr_code = generate_qr_code_base64(provisioning_uri)

                return Response({
                    'requires_2fa': True,
                    '2fa_token': temp_token,
                    'setup_required': True,
                    'secret': user.two_factor_secret,
                    'qr_code': qr_code
                }, status=status.HTTP_200_OK)

            else:
                return Response({
                    'requires_2fa': True,
                    '2fa_token': temp_token,
                    'setup_required': False
                }, status=status.HTTP_200_OK)

        # Si no es admin/superadmin, retornar login normal
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class TwoFactorActivateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        temp_token = request.data.get('2fa_token')
        code = request.data.get('code')

        if not temp_token or not code:
            return Response(
                {"detail": "El token 2FA y el código son requeridos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Validar token temporal
            data = signing.loads(temp_token, salt='2fa-auth', max_age=300)
            user_id = data['user_id']
            if data.get('purpose') != '2fa_verification':
                raise signing.BadSignature()
        except (signing.SignatureExpired, signing.BadSignature):
            return Response(
                {"detail": "El token 2FA ha expirado o es inválido."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verificar TOTP
        is_valid = False
        if check_dev_mode() and code == '123456':
            is_valid = True
        elif user.two_factor_secret:
            totp = pyotp.TOTP(user.two_factor_secret)
            is_valid = totp.verify(code)

        if not is_valid:
            return Response(
                {"detail": "Código de verificación inválido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generar códigos de respaldo
        backup_codes = []
        for _ in range(8):
            backup_code = ''.join(random.choices(string.digits, k=8))
            backup_codes.append(backup_code)

        # Guardar en Base de Datos
        user.two_factor_enabled = True
        user.backup_codes = backup_codes
        user.save()

        # Emitir tokens JWT finales
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'token': str(refresh.access_token),
            'backup_codes': backup_codes,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
            }
        }, status=status.HTTP_200_OK)

class TwoFactorVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        temp_token = request.data.get('2fa_token')
        code = request.data.get('code')

        if not temp_token or not code:
            return Response(
                {"detail": "El token 2FA y el código son requeridos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            data = signing.loads(temp_token, salt='2fa-auth', max_age=300)
            user_id = data['user_id']
            if data.get('purpose') != '2fa_verification':
                raise signing.BadSignature()
        except (signing.SignatureExpired, signing.BadSignature):
            return Response(
                {"detail": "El token 2FA ha expirado o es inválido."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        # 1. Verificar si es código de desarrollo
        is_valid = False

        if check_dev_mode() and code == '123456':
            is_valid = True
        else:
            # 2. Verificar si es código de respaldo
            if isinstance(user.backup_codes, list) and code in user.backup_codes:
                is_valid = True
                user.backup_codes.remove(code)
                user.save()
            # 3. Verificar TOTP
            elif user.two_factor_secret:
                totp = pyotp.TOTP(user.two_factor_secret)
                is_valid = totp.verify(code)

        if not is_valid:
            return Response(
                {"detail": "Código de verificación inválido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Emitir tokens JWT finales
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'token': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
            }
        }, status=status.HTTP_200_OK)
