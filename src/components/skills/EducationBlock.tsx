import type { EducationEntryItem } from '../../data/portfolioData';
import { Reveal } from '../Reveal';

interface EducationBlockProps {
  heading: string;
  entry: EducationEntryItem;
  revealed: boolean;
}

export function EducationBlock({
  heading,
  entry,
  revealed,
}: EducationBlockProps) {
  return (
    <div>
      <Reveal revealed={revealed} delayMs={60}>
        <h3 className="font-display text-base sm:text-lg font-bold tracking-[0.04em] uppercase text-[var(--color-espresso-deep)]">
          {heading}
        </h3>
      </Reveal>

      <Reveal revealed={revealed} delayMs={120}>
        <div className="mt-7 sm:mt-8 border border-[var(--border-hairline)] bg-[var(--color-cream-tonal)]/35 p-6 sm:p-8">
          <p className="font-display text-xs font-bold tracking-[0.1em] uppercase text-[var(--color-orange)]">
            {entry.status}
          </p>

          <h4 className="mt-2 font-display text-lg sm:text-xl font-bold tracking-[-0.015em] text-[var(--color-espresso-deep)] text-balance break-words">
            {entry.qualification}
          </h4>

          <p className="mt-2 pt-3 border-t border-[var(--border-subtle)] text-sm sm:text-[15px] leading-[1.6] text-[var(--color-espresso)] break-words">
            {entry.specialisation}
          </p>
        </div>
      </Reveal>
    </div>
  );
}
