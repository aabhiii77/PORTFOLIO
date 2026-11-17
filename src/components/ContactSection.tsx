import { lazy, memo, Suspense, useEffect } from 'react';
import { CONTACT_CHANNELS } from '../data/portfolioData';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { PORTFOLIO_DIRECT_MAILTO, PORTFOLIO_RECIPIENT_EMAIL } from '../utils/contactApi';
import { ErrorBoundary } from './ErrorBoundary';
import { ContactIntroduction } from './contact/ContactIntroduction';
import { SocialLink } from './contact/SocialLink';

const loadContactForm = () =>
  import('./contact/ContactForm').then((mod) => ({ default: mod.ContactForm }));

const LazyContactForm = lazy(loadContactForm);

function ContactFormPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="border border-[var(--border-hairline)] bg-[var(--color-cream)] p-6 sm:p-8 min-h-[452px] shadow-[0_8px_24px_rgba(29,15,10,0.03)]"
    />
  );
}

function ContactFormFallback() {
  return (
    <div
      role="region"
      aria-label="Direct contact fallback"
      className="border border-[var(--border-hairline)] bg-[var(--color-cream)] p-6 sm:p-8 min-h-[260px] flex flex-col justify-center gap-4 shadow-[0_8px_24px_rgba(29,15,10,0.03)]"
    >
      <p className="font-display text-xs font-semibold tracking-[0.1em] uppercase text-[var(--color-orange)]">
        Direct Email Available
      </p>
      <p className="text-sm leading-[1.6] text-[var(--color-espresso)]">
        The interactive form could not load right now. Reach out directly at{' '}
        <a
          href={PORTFOLIO_DIRECT_MAILTO}
          className="font-semibold underline underline-offset-4 text-[var(--color-espresso-deep)] hover:text-[var(--color-orange)]"
        >
          {PORTFOLIO_RECIPIENT_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}

export const ContactSection = memo(function ContactSection() {
  const { ref, revealed } = useRevealOnScroll<HTMLElement>();

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      void loadContactForm();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadContactForm();
          observer.disconnect();
        }
      },
      { rootMargin: '360px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return (
    <section
      ref={ref}
      id="contact"
      aria-labelledby="heading-contact"
      className="relative scroll-mt-14 sm:scroll-mt-[68px]"
    >
      {/* Subtle Top Boundary Accent Line Sweep */}
      <div
        aria-hidden="true"
        data-revealed={revealed ? 'true' : 'false'}
        className="section-boundary-line pointer-events-none absolute top-0 inset-x-0 h-[1.5px] bg-[var(--color-orange)]"
      />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-22 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-10 lg:gap-14 items-start">
          <div className="min-w-0 flex flex-col gap-8">
            <ContactIntroduction revealed={revealed} />

            <div className="flex flex-col gap-4 sm:gap-5">
              {CONTACT_CHANNELS.map((item, idx) => (
                <SocialLink
                  key={item.id}
                  item={item}
                  index={idx}
                  revealed={revealed}
                />
              ))}
            </div>
          </div>

          <div className="min-w-0 lg:pt-1">
            <ErrorBoundary fallback={<ContactFormFallback />}>
              <Suspense fallback={<ContactFormPlaceholder />}>
                <LazyContactForm revealed={revealed} />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </section>
  );
});
