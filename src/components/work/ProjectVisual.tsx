import { useState } from 'react';
import type { ProjectItem } from '../../data/portfolioData';

interface ProjectVisualProps {
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  fallbackTheme: ProjectItem['fallbackTheme'];
}

function GeometricVisualFallback({
  theme,
}: {
  theme: ProjectItem['fallbackTheme'];
}) {
  if (theme === 'espresso') {
    return (
      <div className="relative w-full h-full bg-[var(--color-espresso-deep)] overflow-hidden flex items-center justify-center p-8 transition-[transform,scale] duration-500 ease-[var(--ease-editorial)] group-hover:scale-[1.03]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60 transition-opacity duration-300 ease-[var(--ease-editorial)] group-hover:opacity-80"
          style={{
            background:
              'radial-gradient(circle at 28% 22%, rgba(238, 109, 13, 0.14) 0%, transparent 55%)',
          }}
        />
        <div className="relative flex items-end gap-4 h-[74%] w-[72%] justify-center">
          <div className="w-7 h-[56%] bg-[var(--color-orange)]/90 flex flex-col justify-end transition-[transform,translate] duration-300 ease-[var(--ease-editorial)] group-hover:-translate-y-0.5">
            <div className="w-full h-6 bg-[var(--color-orange-bright)]" />
          </div>
          <div className="relative w-[62%] h-full bg-[var(--color-cream)] overflow-hidden shadow-[0_14px_28px_rgba(29,15,10,0.45)] flex flex-col justify-between p-5">
            <div
              aria-hidden="true"
              className="w-14 h-28 rounded-r-full -ml-5 bg-[var(--color-cobalt)]"
            />
            <span className="self-end w-3 h-3 rounded-full bg-[var(--color-vermilion)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[var(--color-cream-tonal)] overflow-hidden flex items-center justify-center p-8 transition-[transform,scale] duration-500 ease-[var(--ease-editorial)] group-hover:scale-[1.03]">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50 transition-opacity duration-300 ease-[var(--ease-editorial)] group-hover:opacity-75"
        style={{
          background:
            'radial-gradient(circle at 75% 25%, rgba(251, 236, 220, 0.85) 0%, transparent 60%)',
        }}
      />
      <div className="relative w-[50%] h-[80%] orange-panel-gradient shadow-[0_14px_28px_rgba(55,31,19,0.2)] p-5 flex flex-col justify-between overflow-hidden transition-[transform,translate] duration-300 ease-[var(--ease-editorial)] group-hover:-translate-y-0.5">
        <div
          aria-hidden="true"
          className="self-end w-7 h-3 bg-[var(--color-espresso-deep)] -rotate-45 origin-center translate-y-1"
        />
        <div className="h-[1px] w-12 bg-[var(--color-espresso-deep)]/50" />
      </div>
    </div>
  );
}

export function ProjectVisual({
  title,
  imageUrl,
  imageAlt,
  fallbackTheme,
}: ProjectVisualProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden border border-[var(--border-hairline)] bg-[var(--color-espresso-deep)] transition-[border-color,box-shadow] duration-300 ease-[var(--ease-editorial)] group-hover:border-[var(--color-orange)]/70 group-hover:shadow-[0_18px_36px_rgba(29,15,10,0.1)]">
      {showImage ? (
        <img
          src={imageUrl}
          alt={imageAlt ?? title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="w-full h-full object-cover object-center transition-[transform,scale] duration-500 ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
        />
      ) : (
        <GeometricVisualFallback theme={fallbackTheme} />
      )}

      {/* Restrained Warm Hover Light Reflection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-[var(--ease-editorial)]"
        style={{
          background:
            'linear-gradient(120deg, rgba(251, 236, 220, 0.12) 0%, transparent 48%, rgba(238, 109, 13, 0.05) 100%)',
        }}
      />
    </div>
  );
}
