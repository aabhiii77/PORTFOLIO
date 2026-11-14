import { ArrowUp } from 'lucide-react';
import { FOOTER_META } from '../../data/portfolioData';

export function BackToTop() {
  return (
    <a
      href="#home"
      className="group min-h-[44px] inline-flex items-center gap-3 text-xs font-display font-semibold tracking-[0.12em] uppercase text-[var(--color-cream)] hover:text-[var(--color-orange-bright)] transition-[color,transform,translate,scale] duration-250 ease-[var(--ease-editorial)] hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-orange-bright)] whitespace-nowrap shrink-0"
    >
      <span>{FOOTER_META.backToTopLabel}</span>
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-orange)] text-[var(--color-cream)] transition-[transform,translate,background-color,box-shadow] duration-250 ease-[var(--ease-editorial)] group-hover:-translate-y-[2px] group-hover:bg-[var(--color-orange-bright)] group-hover:shadow-[0_4px_12px_rgba(238,109,13,0.35)]">
        <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.25} />
      </span>
    </a>
  );
}
