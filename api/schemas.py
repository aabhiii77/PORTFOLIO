import re
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

_CONTROL_CHAR_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_HEADER_BREAK_RE = re.compile(r"[\r\n]")


def _normalize_single_line(value: str, field_label: str) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field_label} must be text.")
    if _HEADER_BREAK_RE.search(value) or _CONTROL_CHAR_RE.search(value):
        raise ValueError(f"{field_label} contains unsupported control characters.")
    return " ".join(value.split())


def _normalize_message_body(value: str) -> str:
    if not isinstance(value, str):
        raise ValueError("Message must be text.")
    if _CONTROL_CHAR_RE.search(value):
        raise ValueError("Message contains unsupported control characters.")

    normalized_newlines = value.replace("\r\n", "\n").replace("\r", "\n")
    lines = [" ".join(line.split()) for line in normalized_newlines.split("\n")]
    collapsed = "\n".join(lines).strip()
    collapsed = re.sub(r"\n{3,}", "\n\n", collapsed)
    return collapsed


class ContactSubmissionRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=False, extra="forbid")

    name: str = Field(..., description="Visitor full name")
    email: EmailStr = Field(..., description="Visitor email address")
    subject: str = Field(..., description="Inquiry subject")
    message: str = Field(..., description="Inquiry message body")
    website: str = Field(default="", max_length=500, description="Honeypot field")

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, value: object) -> str:
        if not isinstance(value, str):
            raise ValueError("Please enter your name.")
        cleaned = _normalize_single_line(value, "Name")
        if len(cleaned) < 2:
            raise ValueError("Please enter your name (at least 2 characters).")
        if len(cleaned) > 100:
            raise ValueError("Name must be 100 characters or fewer.")
        return cleaned

    @field_validator("email", mode="before")
    @classmethod
    def validate_email_pre(cls, value: object) -> str:
        if not isinstance(value, str):
            raise ValueError("Please enter a valid email address.")
        cleaned = _normalize_single_line(value, "Email").lower()
        if not cleaned:
            raise ValueError("Please enter your email address.")
        if len(cleaned) > 254:
            raise ValueError("Email address must be 254 characters or fewer.")
        return cleaned

    @field_validator("subject", mode="before")
    @classmethod
    def validate_subject(cls, value: object) -> str:
        if not isinstance(value, str):
            raise ValueError("Please enter a subject.")
        cleaned = _normalize_single_line(value, "Subject")
        if len(cleaned) < 2:
            raise ValueError("Please enter a subject (at least 2 characters).")
        if len(cleaned) > 160:
            raise ValueError("Subject must be 160 characters or fewer.")
        return cleaned

    @field_validator("message", mode="before")
    @classmethod
    def validate_message(cls, value: object) -> str:
        if not isinstance(value, str):
            raise ValueError("Please enter a message.")
        cleaned = _normalize_message_body(value)
        if not cleaned:
            raise ValueError("Please enter a message.")
        if len(cleaned) < 10:
            raise ValueError("Please enter a message of at least 10 characters.")
        if len(cleaned) > 5000:
            raise ValueError("Message must be 5000 characters or fewer.")
        return cleaned

    @field_validator("website", mode="before")
    @classmethod
    def validate_website_honeypot(cls, value: object) -> str:
        if value is None:
            return ""
        if not isinstance(value, str):
            raise ValueError("Invalid submission.")
        return value


class ContactSubmissionResponse(BaseModel):
    status: str
    message: str


class HealthResponse(BaseModel):
    status: str
    service: str
    email_configured: bool
