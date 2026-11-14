import type { CSSProperties, ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  revealed: boolean;
  delayMs?: number;
  variant?: 'up' | 'fade' | 'mask' | 'image-clip';
  className?: string;
}

const VARIANT_CLASS: Record<NonNullable<RevealProps['variant']>, string> = {
  up: 'reveal-block',
  fade: 'reveal-fade',
  mask: 'reveal-mask',
  'image-clip': 'reveal-image-clip',
};

export function Reveal({
  children,
  revealed,
  delayMs = 0,
  variant = 'up',
  className = '',
}: RevealProps) {
  const baseClass = VARIANT_CLASS[variant];
  const style = delayMs
    ? ({ '--reveal-delay': `${delayMs}ms` } as CSSProperties)
    : undefined;

  return (
    <div
      data-revealed={revealed ? 'true' : 'false'}
      style={style}
      className={`min-w-0 ${baseClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
