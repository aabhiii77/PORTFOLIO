import { useEffect, useRef, useState } from 'react';

interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {},
) {
  const { threshold = 0.1, rootMargin = '0px 0px -36px 0px' } = options;
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (revealed) return;

    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
      setRevealed(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [revealed, threshold, rootMargin]);

  return { ref, revealed };
}
