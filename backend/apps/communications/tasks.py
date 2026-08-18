from celery import shared_task
from django.utils import timezone
from datetime import time

def is_within_business_hours():
    """
    Verifica si la hora actual de Bogotá está dentro del horario hábil 
    según la Ley 2300 de 2023 (Lunes a Viernes 8am a 6pm, Sábado 8am a 3pm).
    """
    now = timezone.localtime(timezone.now())
    
    # Lunes a Viernes (0 a 4)
    if 0 <= now.weekday() <= 4:
        return time(8, 0) <= now.time() <= time(18, 0)
    # Sábado (5)
    elif now.weekday() == 5:
        return time(8, 0) <= now.time() <= time(15, 0)
    # Domingo (6) o Festivos
    return False

@shared_task(bind=True, max_retries=3)
def send_notification(self, user_id, message_type, content):
    """
    Envía una notificación (SMS/Email), pero respeta la Ley "Dejen de fregar"
    reencolando la tarea si está fuera de horario.
    """
    if message_type in ['cobranza', 'comercial'] and not is_within_business_hours():
        # Si no es horario hábil, reencolamos la tarea para el siguiente día hábil a las 8 AM
        # Por simplicidad aquí lo reintentamos en 1 hora, pero la lógica exacta de
        # cálculo de siguiente día hábil puede añadirse.
        raise self.retry(countdown=3600)
        
    print(f"Enviando {message_type} a {user_id}: {content}")
    # Lógica real de envío (Twilio, SendGrid, etc.)
    return True
