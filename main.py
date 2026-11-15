import logging
import smtplib
from typing import Callable
import uuid

from fastapi import Depends, FastAPI, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.config import Settings, get_settings
from backend.mailer import (
    EmailAuthenticationError,
    EmailConfigurationError,
    EmailConnectionError,
    EmailDeliveryError,
    send_contact_email,
)
from backend.rate_limit import SlidingWindowRateLimiter
from backend.schemas import (
    ContactErrorResponse,
    ContactSubmissionRequest,
    ContactSuccessResponse,
    HealthResponse,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("portfolio.api")


def _extract_request_id(request: Request) -> str:
    existing = getattr(request.state, "request_id", None)
    if isinstance(existing, str) and existing:
        return existing
    header_id = request.headers.get("x-request-id", "").strip()
    if header_id and header_id.replace("-", "").isalnum() and len(header_id) <= 32:
        req_id = header_id
    else:
        req_id = uuid.uuid4().hex[:12]
    request.state.request_id = req_id
    return req_id


def _extract_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for", "").strip()
    if forwarded_for:
        first_hop = forwarded_for.split(",")[0].strip()
        if first_hop:
            return first_hop
    real_ip = request.headers.get("x-real-ip", "").strip()
    if real_ip:
        return real_ip
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _extract_field_errors(exc: RequestValidationError) -> dict[str, str]:
    field_errors: dict[str, str] = {}
    for err in exc.errors():
        loc = err.get("loc", ())
        field_name = str(loc[-1]) if loc else "form"
        if field_name in {"body", "__root__"}:
            field_name = "form"
        if field_name not in field_errors:
            msg = str(err.get("msg", "Invalid value."))
            if msg.startswith("Value error, "):
                msg = msg[len("Value error, "):]
            field_errors[field_name] = msg
    return field_errors


def _error_response(
    status_code: int,
    message: str,
    code: str,
    request_id: str,
    field_errors: dict[str, str] | None = None,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    body = ContactErrorResponse(
        success=False,
        message=message,
        code=code,
        request_id=request_id,
        field_errors=field_errors,
    ).model_dump(exclude_none=True)
    return JSONResponse(status_code=status_code, content=body, headers=headers)


def create_app(
    settings_provider: Callable[[], Settings] = get_settings,
    smtp_factory: Callable[..., smtplib.SMTP] = smtplib.SMTP,
    rate_limiter: SlidingWindowRateLimiter | None = None,
) -> FastAPI:
    app = FastAPI(
        title="Aayushi Kumar Portfolio API",
        version="1.2.0",
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )

    limiter = rate_limiter or SlidingWindowRateLimiter(max_requests=5, window_seconds=600)

    initial_settings = settings_provider()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(initial_settings.allowed_origins),
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Accept"],
    )

    @app.middleware("http")
    async def attach_request_id(request: Request, call_next):
        req_id = _extract_request_id(request)
        response = await call_next(request)
        response.headers["X-Request-Id"] = req_id
        return response

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        req_id = _extract_request_id(request)
        field_errors = _extract_field_errors(exc)
        first_message = next(
            iter(field_errors.values()),
            "Please check the highlighted fields and try again.",
        )
        logger.info(
            "req_id=%s event=validation_failed fields=%s",
            req_id,
            ",".join(sorted(field_errors.keys())),
        )
        return _error_response(
            status_code=422,
            message=first_message,
            code="VALIDATION_ERROR",
            request_id=req_id,
            field_errors=field_errors,
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        req_id = _extract_request_id(request)
        code = (
            "NOT_FOUND"
            if exc.status_code == 404
            else ("METHOD_NOT_ALLOWED" if exc.status_code == 405 else "HTTP_ERROR")
        )
        message = (
            exc.detail
            if isinstance(exc.detail, str) and exc.detail
            else "The requested API endpoint could not handle this request."
        )
        return _error_response(
            status_code=exc.status_code,
            message=message,
            code=code,
            request_id=req_id,
        )

    @app.get("/", response_model=HealthResponse, include_in_schema=False)
    @app.get("/api/health", response_model=HealthResponse)
    async def health_check(
        settings: Settings = Depends(settings_provider),
    ) -> HealthResponse:
        missing = settings.missing_smtp_env_vars()
        return HealthResponse(
            success=True,
            status="ok",
            service="portfolio-contact-api",
            email_configured=len(missing) == 0,
            missing_env_vars=missing,
        )

    @app.post("/api/contact", response_model=ContactSuccessResponse)
    async def submit_contact(
        request: Request,
        payload: ContactSubmissionRequest,
        settings: Settings = Depends(settings_provider),
    ):
        req_id = _extract_request_id(request)
        email_ready = settings.is_smtp_configured()
        logger.info(
            "req_id=%s event=contact_request_received email_configured=%s",
            req_id,
            email_ready,
        )

        if payload.website.strip():
            logger.info("req_id=%s event=honeypot_rejected", req_id)
            return _error_response(
                status_code=400,
                message="Unable to process submission.",
                code="SPAM_REJECTED",
                request_id=req_id,
            )

        client_ip = _extract_client_ip(request)
        allowed, retry_after = limiter.check_and_record(client_ip)
        if not allowed:
            logger.warning(
                "req_id=%s event=rate_limited retry_after=%s",
                req_id,
                retry_after,
            )
            return _error_response(
                status_code=429,
                message="Too many messages were sent recently. Please wait a few minutes or email directly.",
                code="RATE_LIMITED",
                request_id=req_id,
                headers={"Retry-After": str(retry_after)},
            )

        try:
            await run_in_threadpool(
                send_contact_email,
                payload,
                settings,
                smtp_factory,
                req_id,
            )
        except EmailConfigurationError as exc:
            return _error_response(
                status_code=503,
                message=str(exc),
                code="SMTP_NOT_CONFIGURED",
                request_id=req_id,
            )
        except EmailAuthenticationError as exc:
            return _error_response(
                status_code=502,
                message=str(exc),
                code="SMTP_AUTH_FAILED",
                request_id=req_id,
            )
        except EmailConnectionError as exc:
            return _error_response(
                status_code=502,
                message=str(exc),
                code="SMTP_CONNECTION_FAILED",
                request_id=req_id,
            )
        except EmailDeliveryError as exc:
            return _error_response(
                status_code=502,
                message=str(exc),
                code="SMTP_DELIVERY_FAILED",
                request_id=req_id,
            )
        except Exception as exc:
            logger.error(
                "req_id=%s event=unexpected_error exc=%s",
                req_id,
                exc.__class__.__name__,
            )
            return _error_response(
                status_code=500,
                message="An unexpected error occurred while sending your message. Please use the direct email link instead.",
                code="INTERNAL_ERROR",
                request_id=req_id,
            )

        return ContactSuccessResponse(
            success=True,
            message="Your message has been sent successfully.",
            request_id=req_id,
        )

    return app


app = create_app()
