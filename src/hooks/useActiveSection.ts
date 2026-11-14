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

      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
      if (nearBottom) {
        const lastId = sectionIds[sectionIds.length - 1];
        if (lastId) {
          setActiveSection(lastId);
          return;
        }
      }

      if (window.scrollY < 48) {
        setActiveSection(sectionIds[0] ?? 'home');
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
        setActiveSection(bestId);
      }
    };

    const observer = new IntersectionObserver(
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
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));

    const handleScroll = () => {
      if (performance.now() < lockUntilRef.current) return;

      if (window.scrollY < 48) {
        setActiveSection(sectionIds[0] ?? 'home');
      } else if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 24
      ) {
        const lastId = sectionIds[sectionIds.length - 1];
        if (lastId) setActiveSection(lastId);
      }
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
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [sectionIds]);

  return { activeSection, navigateToSection };
}
