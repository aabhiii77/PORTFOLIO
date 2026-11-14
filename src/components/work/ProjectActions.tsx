import { ArrowRight } from 'lucide-react';

interface ProjectActionsProps {
  title: string;
  liveUrl: string;
  actionLabel: string;
}

export function ProjectActions({
  title,
  liveUrl,
  actionLabel,
}: ProjectActionsProps) {
  return (
    <div className="flex items-center shrink-0 pt-1">
      <a
        href={liveUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${actionLabel}: ${title}`}
        className="after:absolute after:inset-0 inline-flex items-center gap-2.5 min-h-[44px] py-1 font-display text-xs font-semibold tracking-[0.1em] uppercase text-[var(--color-espresso-deep)] group-hover:text-[var(--color-orange)] transition-colors duration-250 ease-[var(--ease-editorial)] whitespace-nowrap focus-visible:outline-none"
      >
        <span>{actionLabel}</span>
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-orange)] text-[var(--color-cream)] transition-[transform,translate,scale,background-color,box-shadow] duration-250 ease-[var(--ease-editorial)] group-hover:bg-[var(--color-orange-bright)] group-hover:translate-x-1 group-hover:shadow-[0_6px_14px_rgba(238,109,13,0.28)]">
          <ArrowRight className="w-4 h-4" strokeWidth={2.25} />
        </span>
      </a>
    </div>
  );
}
