import json
import base64
import hashlib
from django.conf import settings
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class PayloadEncryptionMiddleware(MiddlewareMixin):
    def __init__(self, get_response=None):
        super().__init__(get_response)
        # Usar ENCRYPTION_KEY si está definido, de lo contrario SECRET_KEY
        encryption_key = getattr(settings, 'ENCRYPTION_KEY', settings.SECRET_KEY)
        self.key = hashlib.sha256(encryption_key.encode()).digest()
        self.aesgcm = AESGCM(self.key)

    def process_request(self, request):
        if request.headers.get('X-Encrypted-Payload') == 'true' or request.META.get('HTTP_X_ENCRYPTED_PAYLOAD') == 'true':
            try:
                # Cargar el payload cifrado
                encrypted_payload = json.loads(request.body)
                encrypted_data = encrypted_payload.get('encrypted_data')
                if not encrypted_data:
                    return JsonResponse({'error': 'Missing encrypted_data'}, status=400)
                
                # Descifrar usando AES-GCM
                combined = base64.b64decode(encrypted_data)
                iv = combined[:12]
                ciphertext = combined[12:]
                decrypted_bytes = self.aesgcm.decrypt(iv, ciphertext, None)
                
                # Reemplazar el body de la petición para Django/DRF
                request._body = decrypted_bytes
            except Exception as e:
                return JsonResponse({'error': f'Decryption failed: {str(e)}'}, status=400)

    def process_response(self, request, response):
        # Solo cifrar si la petición original solicitó cifrado y la respuesta es JSON
        content_type = response.headers.get('Content-Type', '')
        if 'application/json' in content_type and response.content:
            if request.headers.get('X-Encrypted-Payload') == 'true' or request.META.get('HTTP_X_ENCRYPTED_PAYLOAD') == 'true':
                try:
                    plaintext = response.content.decode('utf-8')
                    # Cifrar usando AES-GCM
                    iv = AESGCM.generate_nonce()
                    ciphertext = self.aesgcm.encrypt(iv, plaintext.encode('utf-8'), None)
                    combined = iv + ciphertext
                    encrypted_data = base64.b64encode(combined).decode('utf-8')
                    
                    # Reemplazar el contenido de la respuesta
                    response.content = json.dumps({'encrypted_data': encrypted_data})
                    response.headers['X-Encrypted-Payload'] = 'true'
                except Exception as e:
                    # En caso de error, continuar con la respuesta normal (o loggear)
                    pass
        return response
