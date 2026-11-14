import { CONTACT_SECTION_META } from '../../data/portfolioData';
import { Reveal } from '../Reveal';

interface ContactIntroductionProps {
  revealed: boolean;
}

export function ContactIntroduction({ revealed }: ContactIntroductionProps) {
  return (
    <div className="min-w-0">
      <Reveal revealed={revealed} variant="mask" delayMs={0}>
        <h2
          id="heading-contact"
          className="font-display text-[clamp(2.1rem,5.2vw,4rem)] font-bold leading-[0.95] tracking-[-0.03em] uppercase text-[var(--color-espresso-deep)] text-balance break-words"
        >
          {CONTACT_SECTION_META.heading}
        </h2>
      </Reveal>

      <Reveal revealed={revealed} variant="up" delayMs={100}>
        <div className="mt-6 pl-4 border-l-[1.5px] border-[var(--color-orange)] max-w-md">
          <p className="text-sm sm:text-[15px] leading-[1.65] text-[var(--color-espresso)] break-words">
            {CONTACT_SECTION_META.introduction}
          </p>
        </div>
      </Reveal>
    </div>
  );
}
