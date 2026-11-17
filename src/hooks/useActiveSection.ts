import { useCallback, useEffect, useRef, useState } from 'react';
import type { SectionId } from '../data/portfolioData';

export function useActiveSection(sectionIds: SectionId[]) {
  const [activeSection, setActiveSection] = useState<SectionId>(sectionIds[0] ?? 'home');
  const lockUntilRef = useRef<number>(0);

  const navigateToSection = useCallback((id: SectionId) => {
    lockUntilRef.current = performance.now() + 720;
    setActiveSection(id);
  }, []);

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const visibilityMap = new Map<SectionId, number>();
    sectionIds.forEach((id) => visibilityMap.set(id, 0));

    const pickMostVisible = () => {
      if (performance.now() < lockUntilRef.current) return;

      const docEl = document.documentElement;
      const nearBottom = window.innerHeight + window.scrollY >= docEl.scrollHeight - 24;
      if (nearBottom) {
        const lastId = sectionIds[sectionIds.length - 1];
        if (lastId) {
          setActiveSection((prev) => (prev === lastId ? prev : lastId));
          return;
        }
      }

      if (window.scrollY < 48) {
        const firstId = sectionIds[0] ?? 'home';
        setActiveSection((prev) => (prev === firstId ? prev : firstId));
        return;
      }

      let bestId: SectionId | null = null;
      let bestScore = -1;

      for (const id of sectionIds) {
        const ratio = visibilityMap.get(id) ?? 0;
        if (ratio > bestScore) {
          bestScore = ratio;
          bestId = id;
        }
      }

      if (bestId && bestScore > 0) {
        const nextId = bestId;
        setActiveSection((prev) => (prev === nextId ? prev : nextId));
      }
    };

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                const id = entry.target.id as SectionId;
                visibilityMap.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
              });
              pickMostVisible();
            },
            {
              root: null,
              rootMargin: '-18% 0px -35% 0px',
              threshold: [0, 0.15, 0.4, 0.7],
            },
          )
        : null;

    if (observer) {
      elements.forEach((el) => observer.observe(el));
    }

    let scrollRafId: number | null = null;
    const handleScroll = () => {
      if (scrollRafId !== null) return;
      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null;
        if (performance.now() < lockUntilRef.current) return;

        if (window.scrollY < 48) {
          const firstId = sectionIds[0] ?? 'home';
          setActiveSection((prev) => (prev === firstId ? prev : firstId));
          return;
        }

        if (
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 24
        ) {
          const lastId = sectionIds[sectionIds.length - 1];
          if (lastId) {
            setActiveSection((prev) => (prev === lastId ? prev : lastId));
          }
          return;
        }

        if (!observer) {
          const anchorY = window.innerHeight * 0.35;
          let matchedId: SectionId | null = null;
          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= anchorY && rect.bottom >= anchorY) {
              matchedId = el.id as SectionId;
              break;
            }
          }
          if (matchedId) {
            const nextId = matchedId;
            setActiveSection((prev) => (prev === nextId ? prev : nextId));
          }
        }
      });
    };

    const handleHashChange = () => {
      const hashId = window.location.hash.replace('#', '') as SectionId;
      if (sectionIds.includes(hashId)) {
        lockUntilRef.current = performance.now() + 720;
        setActiveSection(hashId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      observer?.disconnect();
      if (scrollRafId !== null) cancelAnimationFrame(scrollRafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [sectionIds]);

  return { activeSection, navigateToSection };
}
