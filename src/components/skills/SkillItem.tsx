import type { CSSProperties } from 'react';
import type { SkillEntryItem } from '../../data/portfolioData';
import { Reveal } from '../Reveal';

interface SkillItemProps {
  item: SkillEntryItem;
  index: number;
  revealed: boolean;
}

const ACCENT_LINE: Record<SkillEntryItem['accent'], string> = {
  orange: 'bg-[var(--color-orange)]',
  vermilion: 'bg-[var(--color-vermilion)]',
  cobalt: 'bg-[var(--color-cobalt)]',
};

export function SkillItem({ item, index, revealed }: SkillItemProps) {
  const baseDelay = 120 + index * 55;

  return (
    <li className="group/skill min-w-0">
      <Reveal revealed={revealed} delayMs={baseDelay}>
        <span className="inline-block font-display text-sm sm:text-[15px] font-semibold text-[var(--color-espresso-deep)]/90 transition-[color,transform,translate] duration-250 ease-[var(--ease-editorial)] group-hover/skill:text-[var(--color-espresso-deep)] group-hover/skill:translate-x-[2px] break-words">
          {item.label}
        </span>
      </Reveal>

      {/* Editorial Horizontal Hairline & Endpoint Accent */}
      <div
        aria-hidden="true"
        className="mt-2 flex items-center w-full overflow-hidden opacity-85 transition-opacity duration-250 ease-[var(--ease-editorial)] group-hover/skill:opacity-100"
      >
        <span
          data-revealed={revealed ? 'true' : 'false'}
          style={{ '--reveal-delay': `${baseDelay + 50}ms` } as CSSProperties}
          className={`reveal-line-x h-[1.5px] flex-1 min-w-0 ${ACCENT_LINE[item.accent]}`}
        />
        <span
          data-revealed={revealed ? 'true' : 'false'}
          style={{ '--reveal-delay': `${baseDelay + 120}ms` } as CSSProperties}
          className={`reveal-fade w-2 h-2 rounded-full shrink-0 transition-[transform,scale] duration-250 ease-[var(--ease-editorial)] group-hover/skill:scale-125 ${ACCENT_LINE[item.accent]}`}
        />
      </div>
    </li>
  );
}
