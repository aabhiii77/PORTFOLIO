export interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
}

export interface ContactApiPayload {
  success?: boolean;
  message?: string;
  code?: string;
  request_id?: string;
  field_errors?: Record<string, string>;
}

export interface ParsedContactResult {
  kind: 'success' | 'validation_error' | 'fallback';
  message?: string;
  fieldErrors?: Record<string, string>;
  diagnosticCode: string;
}

export const PORTFOLIO_RECIPIENT_EMAIL = 'aayushikoomar@gmail.com';
export const PORTFOLIO_DIRECT_MAILTO = `mailto:${PORTFOLIO_RECIPIENT_EMAIL}`;

export function buildMailtoFallbackUrl(values: Pick<ContactFormValues, 'name' | 'email' | 'subject' | 'message'>): string {
  const cleanName = values.name.trim();
  const cleanEmail = values.email.trim();
  const cleanSubject = values.subject.trim();
  const cleanMessage = values.message.trim();

  const subjectLine = cleanSubject
    ? `Portfolio Contact — ${cleanSubject}`
    : 'Portfolio Contact';

  const bodyContent = [
    `Name: ${cleanName}`,
    `Email: ${cleanEmail}`,
    '',
    'Message:',
    cleanMessage,
  ].join('\n');

  return `mailto:${PORTFOLIO_RECIPIENT_EMAIL}?subject=${encodeURIComponent(
    subjectLine
  )}&body=${encodeURIComponent(bodyContent)}`;
}

export function getContactEndpoint(): string {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!baseUrl) {
    return '/api/contact';
  }
  return `${baseUrl.replace(/\/+$/, '')}/api/contact`;
}

export function parseContactApiResponse(
  status: number,
  ok: boolean,
  contentTypeHeader: string | null,
  rawBody: string
): ParsedContactResult {
  const contentType = (contentTypeHeader || '').toLowerCase();
  const trimmedBody = rawBody.trim();

  if (!trimmedBody) {
    return {
      kind: 'fallback',
      diagnosticCode: `EMPTY_RESPONSE_${status}`,
    };
  }

  const looksLikeHtml =
    contentType.includes('text/html') || trimmedBody.startsWith('<');
  if (looksLikeHtml) {
    return {
      kind: 'fallback',
      diagnosticCode: `HTML_RESPONSE_${status}`,
    };
  }

  if (!contentType.includes('application/json') && !trimmedBody.startsWith('{')) {
    return {
      kind: 'fallback',
      diagnosticCode: `NON_JSON_RESPONSE_${status}`,
    };
  }

  let payload: ContactApiPayload;
  try {
    payload = JSON.parse(trimmedBody) as ContactApiPayload;
  } catch {
    return {
      kind: 'fallback',
      diagnosticCode: `INVALID_JSON_${status}`,
    };
  }

  if (status === 422 && payload.field_errors && Object.keys(payload.field_errors).length > 0) {
    return {
      kind: 'validation_error',
      fieldErrors: payload.field_errors,
      diagnosticCode: payload.code || 'VALIDATION_ERROR',
    };
  }

  if (ok && payload.success === true) {
    return {
      kind: 'success',
      message: payload.message,
      diagnosticCode: 'OK',
    };
  }

  return {
    kind: 'fallback',
    diagnosticCode: payload.code || `HTTP_${status}`,
  };
}
