from dataclasses import dataclass
from functools import lru_cache
import os
from pathlib import Path
from dotenv import load_dotenv

# Load local .env if present without overriding platform environment variables
_ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=_ROOT_DIR / ".env", override=False)


def _parse_port(raw_value: str | None, default: int = 587) -> int:
    if not raw_value:
        return default
    try:
        port = int(raw_value.strip())
        return port if 1 <= port <= 65535 else default
    except ValueError:
        return default


def _parse_timeout(raw_value: str | None, default: float = 15.0) -> float:
    if not raw_value:
        return default
    try:
        timeout = float(raw_value.strip())
        return timeout if 1.0 <= timeout <= 60.0 else default
    except ValueError:
        return default


def _parse_allowed_origins() -> tuple[str, ...]:
    origins: list[str] = []
    raw_origins = os.getenv("ALLOWED_ORIGINS", "")
    for item in raw_origins.split(","):
        cleaned = item.strip().rstrip("/")
        if cleaned and cleaned != "*" and cleaned.startswith(("http://", "https://")):
            if cleaned not in origins:
                origins.append(cleaned)

    app_url = os.getenv("APP_URL", "").strip().rstrip("/")
    if app_url and app_url.startswith(("http://", "https://")) and app_url not in origins:
        origins.append(app_url)

    vercel_url = os.getenv("VERCEL_URL", "").strip()
    if vercel_url:
        normalized_vercel = (
            vercel_url if vercel_url.startswith(("http://", "https://")) else f"https://{vercel_url}"
        ).rstrip("/")
        if normalized_vercel not in origins:
            origins.append(normalized_vercel)

    if not origins:
        origins.extend(["http://localhost:3000", "http://127.0.0.1:3000"])

    return tuple(origins)


@dataclass(frozen=True)
class Settings:
    smtp_host: str
    smtp_port: int
    smtp_username: str
    smtp_app_password: str
    contact_recipient_email: str
    smtp_timeout_seconds: float
    allowed_origins: tuple[str, ...]

    def is_smtp_configured(self) -> bool:
        return bool(
            self.smtp_host
            and self.smtp_port > 0
            and self.smtp_username
            and self.smtp_app_password
            and self.contact_recipient_email
        )


def load_settings_from_env() -> Settings:
    return Settings(
        smtp_host=os.getenv("SMTP_HOST", "smtp.gmail.com").strip(),
        smtp_port=_parse_port(os.getenv("SMTP_PORT"), default=587),
        smtp_username=os.getenv("SMTP_USERNAME", "").strip(),
        smtp_app_password=os.getenv("SMTP_APP_PASSWORD", "").strip(),
        contact_recipient_email=os.getenv(
            "CONTACT_RECIPIENT_EMAIL", "aayushikoomar@gmail.com"
        ).strip(),
        smtp_timeout_seconds=_parse_timeout(
            os.getenv("SMTP_TIMEOUT_SECONDS"), default=15.0
        ),
        allowed_origins=_parse_allowed_origins(),
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return load_settings_from_env()
