import { ArrowUpRight } from 'lucide-react';
import type { ContactChannelItem } from '../../data/portfolioData';
import { Reveal } from '../Reveal';

interface SocialLinkProps {
  item: ContactChannelItem;
  index: number;
  revealed: boolean;
}

export function SocialLink({ item, index, revealed }: SocialLinkProps) {
  const delayMs = 110 + index * 90;
  const isExternal = item.url.startsWith('http');

  return (
    <Reveal revealed={revealed} delayMs={delayMs}>
      <a
        href={item.url}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="group min-h-[84px] p-5 sm:p-6 border border-[var(--border-hairline)] bg-[var(--color-cream)] hover:border-[var(--color-orange)] hover:bg-[var(--color-cream-tonal)]/30 transition-[border-color,background-color,transform,translate,scale,box-shadow] duration-250 ease-[var(--ease-editorial)] hover:-translate-y-[3px] hover:shadow-[0_12px_26px_rgba(29,15,10,0.09)] active:translate-y-0 active:scale-[0.985] flex items-center justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-orange)]"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-display font-semibold tracking-[0.12em] uppercase text-[var(--color-espresso)]/70">
            {item.label}
          </p>
          <p className="mt-1.5 font-display text-sm sm:text-base font-bold tracking-[-0.01em] text-[var(--color-espresso-deep)] group-hover:text-[var(--color-orange)] transition-colors duration-250 [overflow-wrap:anywhere]">
            {item.handle}
          </p>
        </div>

        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-espresso)]/25 text-[var(--color-espresso-deep)] group-hover:border-[var(--color-orange)] group-hover:bg-[var(--color-orange)] group-hover:text-[var(--color-cream)] transition-[border-color,background-color,color,transform,translate] duration-250 ease-[var(--ease-editorial)] shrink-0">
          <ArrowUpRight
            className="w-4 h-4 transition-[transform,translate] duration-250 ease-[var(--ease-editorial)] group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
            strokeWidth={2}
          />
        </span>
      </a>
    </Reveal>
  );
}
