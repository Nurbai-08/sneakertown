import logging
import smtplib
from email.message import EmailMessage

from ..config import settings


logger = logging.getLogger(__name__)


def send_password_reset_email(recipient: str, token: str) -> None:
    reset_url = f"{settings.frontend_url.rstrip('/')}/reset-password?token={token}"
    if not settings.smtp_host:
        if settings.is_production:
            logger.error("SMTP is not configured; password reset email was not sent")
        else:
            logger.warning("Development password reset link for %s: %s", recipient, reset_url)
        return

    message = EmailMessage()
    message["Subject"] = "Восстановление пароля SneakerTown"
    message["From"] = str(settings.smtp_from)
    message["To"] = recipient
    message.set_content(
        "Чтобы установить новый пароль, откройте ссылку:\n\n"
        f"{reset_url}\n\n"
        f"Ссылка действует {settings.password_reset_minutes} минут."
    )

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
        if settings.smtp_starttls:
            smtp.starttls()
        if settings.smtp_user and settings.smtp_password:
            smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(message)
