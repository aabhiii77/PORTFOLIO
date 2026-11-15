import { memo } from 'react';
import { PROJECTS, PROJECTS_SECTION_META } from '../data/portfolioData';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { Reveal } from './Reveal';
import { ProjectGrid } from './work/ProjectGrid';

export const WorkSection = memo(function WorkSection() {
  const { ref, revealed } = useRevealOnScroll<HTMLElement>();

  return (
    <section
      ref={ref}
      id="projects"
      aria-labelledby="heading-projects"
      className="relative scroll-mt-14 sm:scroll-mt-[68px] border-b border-[var(--border-hairline)]"
    >
      {/* Subtle Top Boundary Accent Line Sweep */}
      <div
        aria-hidden="true"
        data-revealed={revealed ? 'true' : 'false'}
        className="section-boundary-line pointer-events-none absolute top-0 inset-x-0 h-[1.5px] bg-[var(--color-orange)]"
      />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-22 lg:py-24">
        <div className="pb-8 border-b border-[var(--border-hairline)]">
          <Reveal revealed={revealed} variant="mask" delayMs={0}>
            <h2
              id="heading-projects"
              className="font-display text-[clamp(2rem,4.5vw,3.15rem)] font-bold leading-[0.98] tracking-[-0.025em] uppercase text-[var(--color-espresso-deep)] text-balance"
            >
              {PROJECTS_SECTION_META.heading}
            </h2>
          </Reveal>
        </div>

        <ProjectGrid projects={PROJECTS} revealed={revealed} />
      </div>
    </section>
  );
});
