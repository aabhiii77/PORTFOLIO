import logging
import smtplib
from typing import Callable

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.concurrency import run_in_threadpool
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import Settings, get_settings
from .mailer import EmailConfigurationError, EmailDeliveryError, send_contact_email
from .schemas import ContactSubmissionRequest, ContactSubmissionResponse, HealthResponse

logger = logging.getLogger("portfolio.api")


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


def create_app(
    settings_provider: Callable[[], Settings] = get_settings,
    smtp_factory: Callable[..., smtplib.SMTP] = smtplib.SMTP,
) -> FastAPI:
    app = FastAPI(
        title="Aayushi Kumar Portfolio API",
        version="1.0.0",
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )

    initial_settings = settings_provider()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(initial_settings.allowed_origins),
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type"],
    )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        field_errors = _extract_field_errors(exc)
        first_message = next(
            iter(field_errors.values()),
            "Please check the highlighted fields and try again.",
        )
        return JSONResponse(
            status_code=422,
            content={
                "detail": first_message,
                "field_errors": field_errors,
            },
        )

    @app.get("/api/health", response_model=HealthResponse)
    async def health_check(
        settings: Settings = Depends(settings_provider),
    ) -> HealthResponse:
        return HealthResponse(
            status="ok",
            service="portfolio-contact-api",
            email_configured=settings.is_smtp_configured(),
        )

    @app.post(
        "/api/contact",
        response_model=ContactSubmissionResponse,
        status_code=status.HTTP_200_OK,
    )
    async def submit_contact(
        payload: ContactSubmissionRequest,
        settings: Settings = Depends(settings_provider),
    ) -> ContactSubmissionResponse:
        if payload.website.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to process submission.",
            )

        try:
            await run_in_threadpool(
                send_contact_email,
                payload,
                settings,
                smtp_factory,
            )
        except EmailConfigurationError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(exc),
            ) from exc
        except EmailDeliveryError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=str(exc),
            ) from exc
        except Exception as exc:
            logger.error("Unexpected contact error (%s)", exc.__class__.__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred while sending your message. Please use the direct email link instead.",
            ) from exc

        return ContactSubmissionResponse(
            status="sent",
            message="Thank you — your message has been sent to Aayushi's inbox.",
        )

    return app


app = create_app()
