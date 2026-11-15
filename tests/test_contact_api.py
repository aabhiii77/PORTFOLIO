from datetime import datetime, timezone
from email.message import EmailMessage
import smtplib
from typing import Any

from fastapi.testclient import TestClient

from main import create_app
from backend.config import Settings
from backend.mailer import build_contact_email
from backend.rate_limit import SlidingWindowRateLimiter
from backend.schemas import ContactSubmissionRequest


def _configured_settings() -> Settings:
    return Settings(
        smtp_host="smtp.gmail.com",
        smtp_port=587,
        smtp_username="aayushikoomar@gmail.com",
        smtp_app_password="test-app-password-secret",
        contact_recipient_email="aayushikoomar@gmail.com",
        smtp_timeout_seconds=10.0,
        allowed_origins=("http://localhost:3000",),
    )


def _unconfigured_settings() -> Settings:
    return Settings(
        smtp_host="smtp.gmail.com",
        smtp_port=587,
        smtp_username="aayushikoomar@gmail.com",
        smtp_app_password="",
        contact_recipient_email="aayushikoomar@gmail.com",
        smtp_timeout_seconds=10.0,
        allowed_origins=("http://localhost:3000",),
    )


class RecordingMockSMTP:
    def __init__(
        self,
        sent_messages: list[EmailMessage],
        calls: list[tuple[str, Any]],
        error_on_login: Exception | None = None,
        error_on_connect: Exception | None = None,
    ) -> None:
        self._sent_messages = sent_messages
        self._calls = calls
        self._error_on_login = error_on_login
        self._error_on_connect = error_on_connect

    def __call__(self, host: str, port: int, timeout: float = 15.0) -> "RecordingMockSMTP":
        self._calls.append(("connect", (host, port, timeout)))
        if self._error_on_connect is not None:
            raise self._error_on_connect
        return self

    def __enter__(self) -> "RecordingMockSMTP":
        return self

    def __exit__(self, _exc_type: Any, _exc: Any, _tb: Any) -> bool:
        self._calls.append(("close", None))
        return False

    def ehlo(self) -> tuple[int, bytes]:
        self._calls.append(("ehlo", None))
        return (250, b"OK")

    def starttls(self, context: Any = None) -> tuple[int, bytes]:
        self._calls.append(("starttls", context is not None))
        return (220, b"Ready")

    def login(self, user: str, password: str) -> tuple[int, bytes]:
        self._calls.append(("login", (user, password)))
        if self._error_on_login is not None:
            raise self._error_on_login
        return (235, b"Accepted")

    def send_message(self, msg: EmailMessage) -> dict[str, Any]:
        self._calls.append(("send_message", msg["Subject"]))
        self._sent_messages.append(msg)
        return {}


def test_health_endpoint_when_configured() -> None:
    app = create_app(settings_provider=_configured_settings)
    client = TestClient(app)
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.json()
    assert body == {
        "success": True,
        "status": "ok",
        "service": "portfolio-contact-api",
        "email_configured": True,
        "missing_env_vars": [],
    }
    assert "test-app-password-secret" not in res.text
    assert "aayushikoomar@gmail.com" not in res.text

    root_res = client.get("/")
    assert root_res.status_code == 200
    assert root_res.json() == body


def test_health_endpoint_when_unconfigured() -> None:
    app = create_app(settings_provider=_unconfigured_settings)
    client = TestClient(app)
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert body["email_configured"] is False
    assert body["missing_env_vars"] == ["SMTP_APP_PASSWORD"]


def test_successful_contact_submission_with_mocked_smtp() -> None:
    sent: list[EmailMessage] = []
    calls: list[tuple[str, Any]] = []
    mock_smtp = RecordingMockSMTP(sent_messages=sent, calls=calls)
    app = create_app(settings_provider=_configured_settings, smtp_factory=mock_smtp)
    client = TestClient(app)

    res = client.post(
        "/api/contact",
        json={
            "name": "  Rohan   Sharma  ",
            "email": "  Rohan.Sharma@Example.com ",
            "subject": "  ML   Internship Inquiry ",
            "message": "Hello Aayushi,\n\nI enjoyed reading about Ayucarez and Blockwise.AI.",
            "website": "",
        },
    )

    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert body["message"] == "Your message has been sent successfully."
    assert len(body["request_id"]) > 0
    assert len(sent) == 1

    msg = sent[0]
    assert msg["From"] == "Portfolio Contact <aayushikoomar@gmail.com>"
    assert msg["To"] == "aayushikoomar@gmail.com"
    assert msg["Reply-To"] == "rohan.sharma@example.com"
    assert msg["Subject"] == "Portfolio Contact — ML Internship Inquiry"

    body_text = msg.get_body(preferencelist=("plain",)).get_content()
    assert "Rohan Sharma" in body_text
    assert "rohan.sharma@example.com" in body_text
    assert "ML Internship Inquiry" in body_text
    assert "UTC" in body_text
    assert "Ayucarez and Blockwise.AI" in body_text

    call_names = [name for name, _ in calls]
    assert call_names == ["connect", "ehlo", "starttls", "ehlo", "login", "send_message", "close"]


def test_missing_name_rejected() -> None:
    app = create_app(settings_provider=_configured_settings)
    client = TestClient(app)
    res = client.post(
        "/api/contact",
        json={
            "name": "   ",
            "email": "visitor@example.com",
            "subject": "Project Question",
            "message": "Interested in discussing your railway operations project.",
            "website": "",
        },
    )
    assert res.status_code == 422
    body = res.json()
    assert body["success"] is False
    assert body["code"] == "VALIDATION_ERROR"
    assert "name" in body["field_errors"]


def test_invalid_email_rejected() -> None:
    app = create_app(settings_provider=_configured_settings)
    client = TestClient(app)
    res = client.post(
        "/api/contact",
        json={
            "name": "Visitor Name",
            "email": "not-an-email",
            "subject": "Project Question",
            "message": "Interested in discussing your railway operations project.",
            "website": "",
        },
    )
    assert res.status_code == 422
    body = res.json()
    assert body["success"] is False
    assert body["code"] == "VALIDATION_ERROR"
    assert "email" in body["field_errors"]


def test_missing_subject_rejected() -> None:
    app = create_app(settings_provider=_configured_settings)
    client = TestClient(app)
    res = client.post(
        "/api/contact",
        json={
            "name": "Visitor Name",
            "email": "visitor@example.com",
            "subject": "",
            "message": "Interested in discussing your railway operations project.",
            "website": "",
        },
    )
    assert res.status_code == 422
    body = res.json()
    assert body["success"] is False
    assert "subject" in body["field_errors"]


def test_empty_message_rejected() -> None:
    app = create_app(settings_provider=_configured_settings)
    client = TestClient(app)
    res = client.post(
        "/api/contact",
        json={
            "name": "Visitor Name",
            "email": "visitor@example.com",
            "subject": "Project Question",
            "message": "   \n   ",
            "website": "",
        },
    )
    assert res.status_code == 422
    body = res.json()
    assert body["success"] is False
    assert "message" in body["field_errors"]


def test_excessively_long_message_rejected() -> None:
    app = create_app(settings_provider=_configured_settings)
    client = TestClient(app)
    res = client.post(
        "/api/contact",
        json={
            "name": "Visitor Name",
            "email": "visitor@example.com",
            "subject": "Long Message",
            "message": "a" * 5001,
            "website": "",
        },
    )
    assert res.status_code == 422
    assert "message" in res.json()["field_errors"]


def test_filled_honeypot_rejected_without_sending_email() -> None:
    sent: list[EmailMessage] = []
    calls: list[tuple[str, Any]] = []
    mock_smtp = RecordingMockSMTP(sent_messages=sent, calls=calls)
    app = create_app(settings_provider=_configured_settings, smtp_factory=mock_smtp)
    client = TestClient(app)

    res = client.post(
        "/api/contact",
        json={
            "name": "Bot User",
            "email": "bot@example.com",
            "subject": "Automated Promo",
            "message": "Buy our SEO package right now with huge discounts.",
            "website": "https://spam.example",
        },
    )
    assert res.status_code == 400
    body = res.json()
    assert body["success"] is False
    assert body["code"] == "SPAM_REJECTED"
    assert sent == []
    assert calls == []


def test_smtp_authentication_failure_returns_safe_error() -> None:
    sent: list[EmailMessage] = []
    calls: list[tuple[str, Any]] = []
    mock_smtp = RecordingMockSMTP(
        sent_messages=sent,
        calls=calls,
        error_on_login=smtplib.SMTPAuthenticationError(535, b"5.7.8 Username and Password not accepted"),
    )
    app = create_app(settings_provider=_configured_settings, smtp_factory=mock_smtp)
    client = TestClient(app)

    res = client.post(
        "/api/contact",
        json={
            "name": "Visitor Name",
            "email": "visitor@example.com",
            "subject": "Project Collaboration",
            "message": "Would love to collaborate on an AI healthcare prototype.",
            "website": "",
        },
    )
    assert res.status_code == 502
    body = res.json()
    assert body["success"] is False
    assert body["code"] == "SMTP_AUTH_FAILED"
    assert "test-app-password-secret" not in res.text
    assert "5.7.8" not in res.text
    assert sent == []


def test_smtp_connection_failure_returns_safe_error() -> None:
    sent: list[EmailMessage] = []
    calls: list[tuple[str, Any]] = []
    mock_smtp = RecordingMockSMTP(
        sent_messages=sent,
        calls=calls,
        error_on_connect=TimeoutError("Timed out connecting to smtp.gmail.com"),
    )
    app = create_app(settings_provider=_configured_settings, smtp_factory=mock_smtp)
    client = TestClient(app)

    res = client.post(
        "/api/contact",
        json={
            "name": "Visitor Name",
            "email": "visitor@example.com",
            "subject": "Project Collaboration",
            "message": "Would love to collaborate on an AI healthcare prototype.",
            "website": "",
        },
    )
    assert res.status_code == 502
    body = res.json()
    assert body["success"] is False
    assert body["code"] == "SMTP_CONNECTION_FAILED"
    assert "smtp.gmail.com" not in res.text
    assert sent == []


def test_missing_env_configuration_returns_honest_503() -> None:
    sent: list[EmailMessage] = []
    calls: list[tuple[str, Any]] = []
    mock_smtp = RecordingMockSMTP(sent_messages=sent, calls=calls)
    app = create_app(settings_provider=_unconfigured_settings, smtp_factory=mock_smtp)
    client = TestClient(app)

    res = client.post(
        "/api/contact",
        json={
            "name": "Visitor Name",
            "email": "visitor@example.com",
            "subject": "Project Collaboration",
            "message": "Would love to collaborate on an AI healthcare prototype.",
            "website": "",
        },
    )
    assert res.status_code == 503
    body = res.json()
    assert body["success"] is False
    assert body["code"] == "SMTP_NOT_CONFIGURED"
    assert calls == []


def test_rate_limiting_blocks_excessive_requests() -> None:
    sent: list[EmailMessage] = []
    calls: list[tuple[str, Any]] = []
    mock_smtp = RecordingMockSMTP(sent_messages=sent, calls=calls)
    limiter = SlidingWindowRateLimiter(max_requests=2, window_seconds=600)
    app = create_app(
        settings_provider=_configured_settings,
        smtp_factory=mock_smtp,
        rate_limiter=limiter,
    )
    client = TestClient(app)

    payload = {
        "name": "Visitor Name",
        "email": "visitor@example.com",
        "subject": "Hello",
        "message": "Valid length message here for testing rate limiting.",
        "website": "",
    }
    assert client.post("/api/contact", json=payload).status_code == 200
    assert client.post("/api/contact", json=payload).status_code == 200
    third = client.post("/api/contact", json=payload)
    assert third.status_code == 429
    assert third.json()["code"] == "RATE_LIMITED"
    assert "retry-after" in third.headers


def test_header_injection_and_html_escaping() -> None:
    app = create_app(settings_provider=_configured_settings)
    client = TestClient(app)
    res = client.post(
        "/api/contact",
        json={
            "name": "Visitor\r\nBcc: attacker@evil.com",
            "email": "visitor@example.com",
            "subject": "Hello",
            "message": "Valid length message here for testing.",
            "website": "",
        },
    )
    assert res.status_code == 422

    req = ContactSubmissionRequest(
        name="Aayushi <Test>",
        email="visitor@example.com",
        subject="Security & Testing",
        message="<script>alert('xss')</script> Valid message content.",
        website="",
    )
    msg = build_contact_email(
        req,
        _configured_settings(),
        sent_at_utc=datetime(2026, 11, 14, 17, 0, 0, tzinfo=timezone.utc),
    )
    html_part = msg.get_body(preferencelist=("html",)).get_content()
    assert "<script>" not in html_part
    assert "&lt;script&gt;" in html_part
