# Aayushi Kumar — Personal Portfolio & Python FastAPI Contact Backend

Personal developer portfolio built with **React + TypeScript + Vite + Tailwind CSS** and a **Python FastAPI** contact backend delivering inquiries via **Gmail SMTP (STARTTLS)**.

## Architecture Overview

- **Frontend (`src/`)**: React SPA featuring `HOME`, `PROJECTS`, `TECHNICAL PROFILE`, and `CONTACT` sections.
- **Contact Form (`src/components/contact/ContactForm.tsx`, `src/utils/contactApi.ts`)**: Submits validated JSON payloads to `${VITE_API_BASE_URL}/api/contact` (or same-origin `/api/contact` during local development) with a `20s` `AbortController` timeout, duplicate-submit locking, strict Content-Type + JSON verification, confirmed Python backend success feedback, and a calm prefilled `mailto:aayushikoomar@gmail.com` (`OPEN EMAIL APP`) fallback that preserves visitor inputs whenever backend delivery cannot be confirmed.
- **Python Backend (`main.py`, `backend/`, `render.yaml`)**:
  - `main.py`: Canonical FastAPI ASGI entrypoint exposing `GET /`, `GET /api/health`, and `POST /api/contact`.
  - `backend/schemas.py`: Pydantic v2 validation, whitespace normalization, length limits, and CR/LF control-character rejection.
  - `backend/mailer.py`: Standard `smtplib.SMTP` + `STARTTLS` + UTF-8 MIME email builder (`From` fixed to authenticated Gmail account, `Reply-To` set to visitor email, HTML-escaped template, UTC timestamp, redacted logging).
  - `backend/rate_limit.py`: Sliding-window per-IP rate limiter (`5` requests per `10` minutes per warm worker).
  - `backend/config.py`: Environment variable loader and explicit CORS origin allowlist.
- **Local Dev Proxy (`server.ts`)**: Spawns `uvicorn main:app` locally when Python FastAPI dependencies are installed and proxies `/api/*` from port `3000` while serving Vite middlewares in development or `dist/` in production.

## API Contract

### `GET /api/health`
```json
{
  "success": true,
  "status": "ok",
  "service": "portfolio-contact-api",
  "email_configured": true,
  "missing_env_vars": []
}
```

### `POST /api/contact`
Accepts `{ "name", "email", "subject", "message", "website" }`:
- **Success (`200`)**: `{ "success": true, "message": "Your message has been sent successfully.", "request_id": "..." }`
- **Failure (`400` / `422` / `429` / `502` / `503`)**: `{ "success": false, "message": "...", "code": "...", "request_id": "...", "field_errors": { ... } }`

## Generating `SMTP_APP_PASSWORD`

1. Enable **2-Step Verification** on the Gmail account (`aayushikoomar@gmail.com`).
2. Open Google Account → **Security → App passwords**, create a 16-character App Password for Mail.
3. Configure `SMTP_APP_PASSWORD` in your Render Web Service Environment Variables (never commit real secrets).

## Local Development & Testing

```bash
# 1. Install frontend dependencies & build
npm install
npm run build

# 2. Install Python dependencies in a virtual environment
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt

# 3. Run Python FastAPI unit & integration tests (14 tests)
.venv/bin/python -m pytest -v

# 4. Run full-stack dev server (Vite + FastAPI proxy on port 3000)
npm run dev
```

## Production Deployment (Render Backend + Vercel Frontend)

### 1. Deploy Python Backend on Render (`render.yaml`)
- Create a Render Web Service from this repository (Render automatically reads `render.yaml`: `pip install -r requirements.txt`, `uvicorn main:app --host 0.0.0.0 --port $PORT`, health check `/api/health`).
- Set the secret and origin environment variables in **Render → Environment**:
  - `SMTP_HOST=smtp.gmail.com`
  - `SMTP_PORT=587`
  - `SMTP_USERNAME=aayushikoomar@gmail.com`
  - `SMTP_APP_PASSWORD=<your-16-char-gmail-app-password>`
  - `CONTACT_RECIPIENT_EMAIL=aayushikoomar@gmail.com`
  - `ALLOWED_ORIGINS=<your-frontend-origin>` (e.g. `https://your-portfolio.vercel.app`)
- Verify `https://<your-render-service>.onrender.com/api/health` returns `"email_configured": true`.

### 2. Connect Frontend Deployment (Vercel / Static Host)
- Set environment variable `VITE_API_BASE_URL=https://<your-render-service>.onrender.com` in your frontend hosting project settings and redeploy so the Vite build embeds the live Python API URL.
