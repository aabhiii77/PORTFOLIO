import { useEffect, useRef, useState } from 'react';

interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {},
) {
  const { threshold = 0.08, rootMargin = '0px 0px -24px 0px' } = options;
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return true;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (revealed) return;

    const node = ref.current;
    if (!node) return;

    if (
      typeof IntersectionObserver === 'undefined' ||
      typeof window.requestAnimationFrame !== 'function'
    ) {
      setRevealed(true);
      return;
    }

    let done = false;
    const triggerReveal = () => {
      if (done) return;
      done = true;
      setRevealed(true);
      observer.disconnect();
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('hashchange', onHashOrFocus);
      node.removeEventListener('focusin', triggerReveal);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight * 0.96) {
            triggerReveal();
            break;
          }
        }
      },
      { threshold, rootMargin },
    );

    let rafPending = false;
    const onScrollOrResize = () => {
      if (done || rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        if (done) return;
        const rect = node.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.98 && rect.bottom > 0) {
          triggerReveal();
        }
      });
    };

    const onHashOrFocus = () => {
      if (node.id && window.location.hash === `#${node.id}`) {
        triggerReveal();
      } else {
        onScrollOrResize();
      }
    };

    observer.observe(node);
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    window.addEventListener('hashchange', onHashOrFocus);
    node.addEventListener('focusin', triggerReveal);
    const initialRaf = requestAnimationFrame(onScrollOrResize);

    return () => {
      done = true;
      cancelAnimationFrame(initialRaf);
      observer.disconnect();
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('hashchange', onHashOrFocus);
      node.removeEventListener('focusin', triggerReveal);
    };
  }, [revealed, threshold, rootMargin]);

  return { ref, revealed };
}
