from datetime import datetime, timezone
from email.message import EmailMessage
from email.utils import formataddr
import html
import logging
import smtplib
import ssl
from typing import Callable

from backend.config import Settings
from backend.schemas import ContactSubmissionRequest

logger = logging.getLogger("portfolio.mailer")


class EmailConfigurationError(RuntimeError):
    """Raised when required SMTP configuration is missing."""


class EmailAuthenticationError(RuntimeError):
    """Raised when SMTP rejects credentials."""


class EmailConnectionError(RuntimeError):
    """Raised when connecting to or timing out against the SMTP server."""


class EmailDeliveryError(RuntimeError):
    """Raised for other SMTP delivery failures."""


def _safe_header_text(value: str) -> str:
    return " ".join(value.replace("\r", " ").replace("\n", " ").split())


def build_contact_email(
    payload: ContactSubmissionRequest,
    settings: Settings,
    sent_at_utc: datetime | None = None,
) -> EmailMessage:
    timestamp = (sent_at_utc or datetime.now(timezone.utc)).astimezone(timezone.utc)
    timestamp_str = timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")

    safe_name = _safe_header_text(payload.name)
    safe_email = _safe_header_text(str(payload.email))
    safe_subject = _safe_header_text(payload.subject)

    msg = EmailMessage()
    msg["From"] = formataddr(("Portfolio Contact", settings.smtp_username))
    msg["To"] = settings.contact_recipient_email
    msg["Reply-To"] = safe_email
    msg["Subject"] = f"Portfolio Contact — {safe_subject}"

    plain_body = (
        "New portfolio contact submission\n"
        "--------------------------------\n\n"
        f"Name: {safe_name}\n"
        f"Email: {safe_email}\n"
        f"Subject: {safe_subject}\n"
        f"Submitted (UTC): {timestamp_str}\n\n"
        "Message:\n"
        f"{payload.message}\n"
    )
    msg.set_content(plain_body, subtype="plain", charset="utf-8")

    escaped_name = html.escape(safe_name, quote=True)
    escaped_email = html.escape(safe_email, quote=True)
    escaped_subject = html.escape(safe_subject, quote=True)
    escaped_time = html.escape(timestamp_str, quote=True)
    escaped_message = html.escape(payload.message, quote=True).replace("\n", "<br />")

    html_body = f"""<!doctype html>
<html lang="en">
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1D0F0A; background-color: #FBECDC; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #371F1338; padding: 24px;">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #EE6D0D; margin: 0 0 8px;">Portfolio Contact</p>
      <h2 style="margin: 0 0 16px; font-size: 20px; color: #1D0F0A;">{escaped_subject}</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #371F13; width: 130px;"><strong>Name</strong></td>
          <td style="padding: 6px 0;">{escaped_name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #371F13;"><strong>Email</strong></td>
          <td style="padding: 6px 0;">{escaped_email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #371F13;"><strong>Submitted (UTC)</strong></td>
          <td style="padding: 6px 0;">{escaped_time}</td>
        </tr>
      </table>
      <div style="border-top: 1px solid #371F1326; padding-top: 14px; font-size: 14px; line-height: 1.6; color: #1D0F0A;">
        {escaped_message}
      </div>
    </div>
  </body>
</html>
"""
    msg.add_alternative(html_body, subtype="html", charset="utf-8")
    return msg


def send_contact_email(
    payload: ContactSubmissionRequest,
    settings: Settings,
    smtp_factory: Callable[..., smtplib.SMTP] = smtplib.SMTP,
    request_id: str = "unknown",
) -> None:
    missing = settings.missing_smtp_env_vars()
    if missing:
        logger.warning(
            "req_id=%s event=smtp_config_missing missing=%s",
            request_id,
            ",".join(missing),
        )
        raise EmailConfigurationError(
            "Email delivery is not configured on the server yet. Please use the direct email link instead."
        )

    email_message = build_contact_email(payload, settings)
    tls_context = ssl.create_default_context()

    logger.info(
        "req_id=%s event=smtp_connecting host=%s port=%s timeout=%s",
        request_id,
        settings.smtp_host,
        settings.smtp_port,
        settings.smtp_timeout_seconds,
    )

    try:
        with smtp_factory(
            settings.smtp_host,
            settings.smtp_port,
            timeout=settings.smtp_timeout_seconds,
        ) as smtp:
            smtp.ehlo()
            smtp.starttls(context=tls_context)
            smtp.ehlo()
            smtp.login(settings.smtp_username, settings.smtp_app_password)
            logger.info("req_id=%s event=smtp_auth_ok", request_id)
            smtp.send_message(email_message)
            logger.info("req_id=%s event=smtp_delivery_accepted", request_id)
    except smtplib.SMTPAuthenticationError as exc:
        logger.warning(
            "req_id=%s event=smtp_auth_failed exc=%s",
            request_id,
            exc.__class__.__name__,
        )
        raise EmailAuthenticationError(
            "Unable to authenticate with the email delivery service right now. Please use the direct email link instead."
        ) from exc
    except (smtplib.SMTPConnectError, smtplib.SMTPServerDisconnected, TimeoutError, OSError) as exc:
        logger.warning(
            "req_id=%s event=smtp_connection_failed exc=%s",
            request_id,
            exc.__class__.__name__,
        )
        raise EmailConnectionError(
            "Could not connect to the email delivery server in time. Please try again later or email directly."
        ) from exc
    except smtplib.SMTPException as exc:
        logger.warning(
            "req_id=%s event=smtp_delivery_failed exc=%s",
            request_id,
            exc.__class__.__name__,
        )
        raise EmailDeliveryError(
            "Unable to deliver your message right now. Please try again later or email directly."
        ) from exc
