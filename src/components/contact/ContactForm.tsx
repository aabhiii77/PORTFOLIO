import { useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { CONTACT_SECTION_META } from '../../data/portfolioData';
import { Reveal } from '../Reveal';

interface ContactFormProps {
  revealed: boolean;
}

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
}

type FieldName = 'name' | 'email' | 'subject' | 'message';
type FieldErrors = Partial<Record<FieldName, string>>;

interface SubmissionState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  feedback: string;
}

const INITIAL_VALUES: FormValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateClientFields(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  const trimmedName = values.name.trim();
  const trimmedEmail = values.email.trim();
  const trimmedSubject = values.subject.trim();
  const trimmedMessage = values.message.trim();

  if (trimmedName.length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  } else if (trimmedName.length > 100) {
    errors.name = 'Name must be 100 characters or fewer.';
  }

  if (!trimmedEmail) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_PATTERN.test(trimmedEmail) || trimmedEmail.length > 254) {
    errors.email = 'Please enter a valid email address.';
  }

  if (trimmedSubject.length < 2) {
    errors.subject = 'Please enter a subject (at least 2 characters).';
  } else if (trimmedSubject.length > 160) {
    errors.subject = 'Subject must be 160 characters or fewer.';
  }

  if (!trimmedMessage) {
    errors.message = 'Please enter a message.';
  } else if (trimmedMessage.length < 10) {
    errors.message = 'Please enter a message of at least 10 characters.';
  } else if (trimmedMessage.length > 5000) {
    errors.message = 'Message must be 5000 characters or fewer.';
  }

  return errors;
}

function getContactEndpoint(): string {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!baseUrl) {
    return '/api/contact';
  }
  return `${baseUrl.replace(/\/+$/, '')}/api/contact`;
}

export function ContactForm({ revealed }: ContactFormProps) {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
    feedback: '',
  });
  const submitLockRef = useRef(false);

  const isSubmitting = submission.status === 'submitting';

  const handleFieldChange = (field: keyof FormValues, nextValue: string) => {
    setValues((prev) => ({ ...prev, [field]: nextValue }));

    if (field !== 'website' && fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }

    if (submission.status === 'success' || submission.status === 'error') {
      setSubmission({ status: 'idle', feedback: '' });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitLockRef.current || isSubmitting) {
      return;
    }

    const clientErrors = validateClientFields(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setSubmission({
        status: 'error',
        feedback: 'Please check the highlighted fields and try again.',
      });
      return;
    }

    submitLockRef.current = true;
    setFieldErrors({});
    setSubmission({ status: 'submitting', feedback: '' });

    try {
      const response = await fetch(getContactEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          website: values.website,
        }),
      });

      let payload: {
        status?: string;
        message?: string;
        detail?: string;
        field_errors?: Record<string, string>;
      } = {};

      try {
        payload = (await response.json()) as typeof payload;
      } catch {
        payload = {};
      }

      if (!response.ok) {
        if (response.status === 422 && payload.field_errors) {
          const nextErrors: FieldErrors = {};
          (['name', 'email', 'subject', 'message'] as const).forEach((key) => {
            const errMsg = payload.field_errors?.[key];
            if (errMsg) {
              nextErrors[key] = errMsg;
            }
          });
          setFieldErrors(nextErrors);
        }

        setSubmission({
          status: 'error',
          feedback:
            payload.detail ||
            'Unable to send your message right now. Please try again or reach out directly via email.',
        });
        return;
      }

      if (payload.status !== 'sent') {
        setSubmission({
          status: 'error',
          feedback:
            'Unexpected server response while sending your message. Please reach out directly via email.',
        });
        return;
      }

      setValues(INITIAL_VALUES);
      setFieldErrors({});
      setSubmission({
        status: 'success',
        feedback:
          payload.message || "Thank you — your message has been sent to Aayushi's inbox.",
      });
    } catch {
      setSubmission({
        status: 'error',
        feedback:
          'Could not reach the server to send your message. Please check your connection or email directly.',
      });
    } finally {
      submitLockRef.current = false;
    }
  };

  const inputBaseClass =
    'w-full px-3.5 py-2.5 min-h-[44px] text-sm text-[var(--color-espresso-deep)] bg-[var(--color-cream-tonal)]/25 border transition-[border-color,background-color,box-shadow] duration-200 ease-[var(--ease-editorial)] placeholder:text-[var(--color-espresso)]/45 focus-visible:outline-none focus-visible:bg-[var(--color-cream)] disabled:opacity-60 disabled:cursor-not-allowed';

  const getFieldBorderClass = (hasError: boolean) =>
    hasError
      ? 'border-[var(--color-vermilion)] focus-visible:border-[var(--color-vermilion)] focus-visible:ring-1 focus-visible:ring-[var(--color-vermilion)]/25'
      : 'border-[var(--border-hairline)] hover:border-[var(--color-espresso)]/45 focus-visible:border-[var(--color-blue-deep)] focus-visible:ring-1 focus-visible:ring-[var(--color-blue-deep)]/25';

  return (
    <Reveal revealed={revealed} delayMs={120}>
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSubmitting}
        className="relative border border-[var(--border-hairline)] bg-[var(--color-cream)] p-6 sm:p-8 shadow-[0_8px_24px_rgba(29,15,10,0.03)]"
      >
        <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-[var(--border-subtle)]">
          <div className="inline-flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full bg-[var(--color-orange)]"
            />
            <p className="font-display text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--color-espresso)]/80">
              Send a Direct Message
            </p>
          </div>
          <span className="font-display text-[10px] tracking-[0.12em] uppercase text-[var(--color-espresso)]/55">
            Direct to Inbox
          </span>
        </div>

        {/* Hidden honeypot field for basic automated spam filtering */}
        <div
          aria-hidden="true"
          className="absolute -left-[9999px] w-px h-px overflow-hidden opacity-0 pointer-events-none"
        >
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(e) => handleFieldChange('website', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label
              htmlFor="contact-name"
              className="block mb-1.5 font-display text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--color-espresso)]/80"
            >
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              maxLength={100}
              autoComplete="name"
              placeholder="Your name"
              disabled={isSubmitting}
              value={values.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
              className={`${inputBaseClass} ${getFieldBorderClass(Boolean(fieldErrors.name))}`}
            />
            {fieldErrors.name && (
              <p
                id="contact-name-error"
                className="mt-1.5 text-xs text-[var(--color-vermilion)]"
              >
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="block mb-1.5 font-display text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--color-espresso)]/80"
            >
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isSubmitting}
              value={values.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
              className={`${inputBaseClass} ${getFieldBorderClass(Boolean(fieldErrors.email))}`}
            />
            {fieldErrors.email && (
              <p
                id="contact-email-error"
                className="mt-1.5 text-xs text-[var(--color-vermilion)]"
              >
                {fieldErrors.email}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-5">
          <label
            htmlFor="contact-subject"
            className="block mb-1.5 font-display text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--color-espresso)]/80"
          >
            Subject
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            required
            maxLength={160}
            placeholder="Project inquiry or collaboration"
            disabled={isSubmitting}
            value={values.subject}
            onChange={(e) => handleFieldChange('subject', e.target.value)}
            aria-invalid={Boolean(fieldErrors.subject)}
            aria-describedby={fieldErrors.subject ? 'contact-subject-error' : undefined}
            className={`${inputBaseClass} ${getFieldBorderClass(Boolean(fieldErrors.subject))}`}
          />
          {fieldErrors.subject && (
            <p
              id="contact-subject-error"
              className="mt-1.5 text-xs text-[var(--color-vermilion)]"
            >
              {fieldErrors.subject}
            </p>
          )}
        </div>

        <div className="mt-4 sm:mt-5">
          <label
            htmlFor="contact-message"
            className="block mb-1.5 font-display text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--color-espresso)]/80"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={4}
            maxLength={5000}
            placeholder="Share a brief note about your project, idea, or question..."
            disabled={isSubmitting}
            value={values.message}
            onChange={(e) => handleFieldChange('message', e.target.value)}
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
            className={`${inputBaseClass} resize-y min-h-[120px] leading-[1.6] ${getFieldBorderClass(
              Boolean(fieldErrors.message)
            )}`}
          />
          {fieldErrors.message && (
            <p
              id="contact-message-error"
              className="mt-1.5 text-xs text-[var(--color-vermilion)]"
            >
              {fieldErrors.message}
            </p>
          )}
        </div>

        {submission.status === 'success' && (
          <div
            role="status"
            aria-live="polite"
            className="mt-5 border-l-[2px] border-[var(--color-blue-deep)] bg-[var(--color-cream-tonal)]/55 px-4 py-3 text-sm text-[var(--color-espresso-deep)] flex items-start gap-2.5"
          >
            <Check
              className="w-4 h-4 text-[var(--color-blue-deep)] shrink-0 mt-0.5"
              strokeWidth={2.25}
            />
            <span>{submission.feedback}</span>
          </div>
        )}

        {submission.status === 'error' && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-5 border-l-[2px] border-[var(--color-vermilion)] bg-[var(--color-cream-tonal)]/55 px-4 py-3 text-sm text-[var(--color-espresso-deep)]"
          >
            <p>{submission.feedback}</p>
            <p className="mt-1.5 text-xs text-[var(--color-espresso)]">
              Direct alternative:{' '}
              <a
                href={CONTACT_SECTION_META.emailHref}
                className="font-medium text-[var(--color-orange)] underline underline-offset-4 hover:text-[var(--color-espresso-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-orange)]"
              >
                aayushikoomar@gmail.com
              </a>
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group inline-flex items-center gap-3 bg-[var(--color-espresso-deep)] text-[var(--color-cream)] pl-5 pr-2.5 py-2.5 min-h-[44px] text-xs font-display font-semibold tracking-[0.1em] uppercase transition-[background-color,transform,translate,scale,box-shadow,opacity] duration-250 ease-[var(--ease-editorial)] hover:bg-[var(--color-espresso)] hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(29,15,10,0.16)] active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-orange)] cursor-pointer whitespace-nowrap"
          >
            <span>{isSubmitting ? 'SENDING MESSAGE...' : 'SEND MESSAGE'}</span>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-orange)] text-[var(--color-cream)] transition-[transform,translate,background-color] duration-250 ease-[var(--ease-editorial)] group-hover:translate-x-1 group-hover:bg-[var(--color-orange-bright)]">
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.25} />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.25} />
              )}
            </span>
          </button>

          <p className="text-[11px] text-[var(--color-espresso)]/65">
            Messages go straight to{' '}
            <span className="font-medium text-[var(--color-espresso)]">
              aayushikoomar@gmail.com
            </span>
          </p>
        </div>
      </form>
    </Reveal>
  );
}
