import type { SkillGroupItem } from '../../data/portfolioData';
import { Reveal } from '../Reveal';
import { SkillItem } from './SkillItem';

interface SkillsListProps {
  heading: string;
  groups: SkillGroupItem[];
  revealed: boolean;
}

export function SkillsList({ heading, groups, revealed }: SkillsListProps) {
  let runningIndex = 0;

  return (
    <div>
      <Reveal revealed={revealed} delayMs={60}>
        <h3 className="font-display text-base sm:text-lg font-bold tracking-[0.04em] uppercase text-[var(--color-espresso-deep)]">
          {heading}
        </h3>
      </Reveal>

      <div className="mt-7 sm:mt-8 space-y-8">
        {groups.map((group) => (
          <div key={group.id}>
            <Reveal revealed={revealed} delayMs={90}>
              <h4 className="text-[11px] font-display font-semibold tracking-[0.12em] uppercase text-[var(--color-espresso)]/75">
                {group.category}
              </h4>
            </Reveal>

            <ul className="mt-4 flex flex-col gap-5">
              {group.items.map((item) => {
                const currentIndex = runningIndex++;
                return (
                  <SkillItem
                    key={item.id}
                    item={item}
                    index={currentIndex}
                    revealed={revealed}
                  />
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
