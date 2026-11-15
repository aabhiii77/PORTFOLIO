import { memo } from 'react';
import {
  EDUCATION_ENTRY,
  SKILL_GROUPS,
  TECHNICAL_PROFILE_META,
} from '../data/portfolioData';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { Reveal } from './Reveal';
import { EducationBlock } from './skills/EducationBlock';
import { SkillsList } from './skills/SkillsList';

export const SkillsEducationSection = memo(function SkillsEducationSection() {
  const { ref, revealed } = useRevealOnScroll<HTMLElement>();

  return (
    <section
      ref={ref}
      id="technical-profile"
      aria-labelledby="heading-technical-profile"
      className="relative scroll-mt-14 sm:scroll-mt-[68px] border-b border-[var(--border-hairline)]"
    >
      {/* Subtle Top Boundary Accent Line Sweep */}
      <div
        aria-hidden="true"
        data-revealed={revealed ? 'true' : 'false'}
        className="section-boundary-line pointer-events-none absolute top-0 inset-x-0 h-[1.5px] bg-[var(--color-cobalt)]"
      />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-22 lg:py-24">
        {/* Clean Editorial Section Header */}
        <div className="pb-8 border-b border-[var(--border-hairline)]">
          <Reveal revealed={revealed} variant="mask" delayMs={0}>
            <h2
              id="heading-technical-profile"
              className="font-display text-[clamp(2rem,4.5vw,3.15rem)] font-bold leading-[0.98] tracking-[-0.025em] uppercase text-[var(--color-espresso-deep)] text-balance"
            >
              {TECHNICAL_PROFILE_META.heading}
            </h2>
          </Reveal>
        </div>

        {/* Two-Column Editorial Spread */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-10 lg:gap-0 items-start">
          <div className="lg:pr-12">
            <EducationBlock
              heading={TECHNICAL_PROFILE_META.educationHeading}
              entry={EDUCATION_ENTRY}
              revealed={revealed}
            />
          </div>

          <div className="pt-10 border-t border-[var(--border-hairline)] lg:pt-0 lg:border-t-0 lg:border-l lg:border-[var(--border-hairline)] lg:pl-12">
            <SkillsList
              heading={TECHNICAL_PROFILE_META.toolkitHeading}
              groups={SKILL_GROUPS}
              revealed={revealed}
            />
          </div>
        </div>
      </div>
    </section>
  );
});
