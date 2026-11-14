import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { MotionConfig, motion } from 'motion/react';
import { NAV_ITEMS, type SectionId } from '../data/portfolioData';

interface NavbarProps {
  activeSection: SectionId;
  onNavigate?: (id: SectionId) => void;
}

export function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);
  const navContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        toggleBtnRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(event.target as Node)
      ) {
        setMobileOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);

    const timer = window.setTimeout(() => {
      firstMobileLinkRef.current?.focus();
    }, 30);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileOpen]);

  const handleLinkClick = (id: SectionId) => {
    onNavigate?.(id);
    setMobileOpen(false);
  };

  return (
    <header
      ref={navContainerRef}
      className="sticky top-0 z-50 w-full nav-surface-texture backdrop-blur-[2px] border-b border-[var(--border-hairline)]"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 h-14 sm:h-[68px] flex items-center justify-end">
        {/* Desktop & Tablet Top-Right Primary Navigation with Fluid Deep-Blue Active Indicator */}
        <MotionConfig reducedMotion="user">
          <nav
            aria-label="Primary navigation"
            className="hidden md:inline-flex items-center gap-0.5 lg:gap-1 p-1 rounded-full nav-surface-texture border border-[var(--border-hairline)] shadow-[0_2px_10px_rgba(29,15,10,0.05)]"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => onNavigate?.(item.id)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`relative px-3.5 lg:px-4 py-2 min-h-[38px] inline-flex items-center rounded-full font-display text-xs lg:text-[13px] tracking-[0.1em] uppercase whitespace-nowrap shrink-0 transition-[color,background-color,transform,translate,scale] duration-250 ease-[var(--ease-editorial)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-deep)] ${
                    isActive
                      ? 'text-[var(--color-cream)] font-semibold'
                      : 'text-[var(--color-espresso)] font-medium hover:bg-[var(--color-cream-tonal)]/85 hover:text-[var(--color-espresso-deep)] hover:-translate-y-[1px]'
                  }`}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="active-nav-indicator"
                      aria-hidden="true"
                      transition={{
                        type: 'tween',
                        duration: 0.52,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute inset-0 rounded-full bg-[var(--color-blue-deep)] shadow-[0_2px_10px_rgba(12,34,73,0.24)]"
                    />
                  ) : null}
                  <span className="relative z-10">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </MotionConfig>

        {/* Mobile Hamburger Toggle */}
        <button
          ref={toggleBtnRef}
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation-menu"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="md:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 rounded-lg text-[var(--color-espresso-deep)] hover:bg-[var(--color-cream-tonal)] active:scale-95 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-deep)]"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" strokeWidth={2} />
          ) : (
            <Menu className="w-6 h-6" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Navigation Overlay */}
      {mobileOpen && (
        <div
          id="mobile-navigation-menu"
          className="md:hidden dropdown-reveal max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-[var(--border-hairline)] paper-texture shadow-[0_12px_32px_rgba(29,15,10,0.1)]"
        >
          <nav
            aria-label="Mobile navigation"
            className="max-w-[1360px] mx-auto px-4 py-3 flex flex-col gap-1"
          >
            {NAV_ITEMS.map((item, idx) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  ref={idx === 0 ? firstMobileLinkRef : undefined}
                  href={item.href}
                  onClick={() => handleLinkClick(item.id)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`min-h-[44px] px-4 rounded-lg flex items-center font-display text-sm tracking-[0.12em] uppercase transition-[color,background-color,transform,translate,scale] duration-200 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-blue-deep)] ${
                    isActive
                      ? 'bg-[var(--color-blue-deep)] text-[var(--color-cream)] font-semibold'
                      : 'text-[var(--color-espresso-deep)] font-medium hover:bg-[var(--color-cream-tonal)] active:bg-[var(--color-cream-tonal)]'
                  }`}
                >
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
