import { CONTACT_CHANNELS } from '../data/portfolioData';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { ContactForm } from './contact/ContactForm';
import { ContactIntroduction } from './contact/ContactIntroduction';
import { SocialLink } from './contact/SocialLink';

export function ContactSection() {
  const { ref, revealed } = useRevealOnScroll<HTMLElement>();

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
            <ContactForm revealed={revealed} />
          </div>
        </div>
      </div>
    </section>
  );
}
