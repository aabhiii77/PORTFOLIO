import { FOOTER_META, NAV_ITEMS } from '../data/portfolioData';
import { BackToTop } from './footer/BackToTop';

export function PortfolioFooter() {
  return (
    <footer className="border-t border-[var(--border-hairline)] overflow-hidden">
      {/* Upper Geometric Closing Band inspired by Master Reference */}
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-[148px_1fr_256px] items-stretch">
        {/* Left Cobalt + Vermilion Geometric Circles */}
        <div
          aria-hidden="true"
          className="hidden lg:block relative overflow-hidden border-r border-[var(--border-hairline)] min-h-[200px]"
        >
          <div className="absolute -left-10 bottom-0 w-36 h-36 rounded-full bg-[var(--color-cobalt)]" />
          <div className="absolute left-14 bottom-0 w-24 h-24 rounded-full bg-[var(--color-vermilion)]" />
        </div>

        {/* Center Editorial Closing Statement & Navigation Links */}
        <div className="min-w-0 px-4 sm:px-6 lg:px-10 py-12 sm:py-14 flex flex-col justify-between gap-8">
          <p className="font-display text-[clamp(1.45rem,3vw,2.35rem)] font-bold leading-[1.06] tracking-[-0.025em] uppercase text-[var(--color-espresso-deep)] max-w-xl text-balance break-words">
            {FOOTER_META.closingStatement}
          </p>

          <nav
            aria-label="Footer section navigation"
            className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-x-5 gap-y-1"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="min-h-[44px] inline-flex items-center text-xs font-display font-semibold tracking-[0.1em] uppercase text-[var(--color-espresso)] hover:text-[var(--color-orange)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98] transition-[color,transform,translate,scale] duration-200 ease-[var(--ease-editorial)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-orange)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right Deep Blue Panel with Cream Arch matching master reference */}
        <div
          aria-hidden="true"
          className="relative bg-[var(--color-blue-deep)] min-h-[120px] lg:min-h-full px-6 pt-8 flex items-end justify-center overflow-hidden border-t lg:border-t-0 lg:border-l border-[var(--border-hairline)]"
        >
          <div className="w-44 h-22 sm:w-52 sm:h-26 rounded-t-full bg-[var(--color-cream)]" />
        </div>
      </div>

      {/* Bottom Copyright & Back-to-Top Bar */}
      <div className="bg-[var(--color-espresso-deep)] espresso-texture text-[var(--color-cream)] border-t border-[var(--color-espresso)]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs tracking-[0.04em] text-[var(--color-cream)]/80">
            {FOOTER_META.copyright}
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
