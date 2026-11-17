import { memo, useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { HERO_PROFILE } from '../data/portfolioData';

export const HeroSection = memo(function HeroSection() {
  const [imageFailed, setImageFailed] = useState(false);
  const showPortraitImage = Boolean(HERO_PROFILE.portraitUrl) && !imageFailed;

  const rightCanvasRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const cachedRectRef = useRef<DOMRect | null>(null);
  const canHoverParallaxRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncCapability = () => {
      canHoverParallaxRef.current = finePointer.matches && !reducedMotion.matches;
      cachedRectRef.current = null;
      if (!canHoverParallaxRef.current) {
        if (frameRef.current) frameRef.current.style.transform = '';
        if (haloRef.current) haloRef.current.style.transform = '';
      }
    };

    const invalidateRect = () => {
      cachedRectRef.current = null;
    };

    syncCapability();
    finePointer.addEventListener?.('change', syncCapability);
    reducedMotion.addEventListener?.('change', syncCapability);
    window.addEventListener('resize', invalidateRect, { passive: true });

    return () => {
      finePointer.removeEventListener?.('change', syncCapability);
      reducedMotion.removeEventListener?.('change', syncCapability);
      window.removeEventListener('resize', invalidateRect);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const applyParallax = (xNorm: number, yNorm: number, smoothReset: boolean) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const transition = smoothReset ? 'transform 450ms var(--ease-editorial)' : 'none';
      if (frameRef.current) {
        frameRef.current.style.transition = transition;
        frameRef.current.style.transform = `translate3d(${(xNorm * 6).toFixed(2)}px, ${(yNorm * 5).toFixed(2)}px, 0)`;
      }
      if (haloRef.current) {
        haloRef.current.style.transition = transition;
        haloRef.current.style.transform = `translate3d(${(-xNorm * 4).toFixed(2)}px, ${(-yNorm * 3).toFixed(2)}px, 0)`;
      }
      rafRef.current = null;
    });
  };

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (!canHoverParallaxRef.current || event.pointerType !== 'mouse') return;
    cachedRectRef.current = rightCanvasRef.current?.getBoundingClientRect() ?? null;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!canHoverParallaxRef.current || event.pointerType !== 'mouse') return;
    const rect =
      cachedRectRef.current ?? rightCanvasRef.current?.getBoundingClientRect() ?? null;
    if (!rect || rect.width === 0 || rect.height === 0) return;
    cachedRectRef.current = rect;

    const xNorm = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const yNorm = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    applyParallax(
      Math.max(-1, Math.min(1, xNorm)),
      Math.max(-1, Math.min(1, yNorm)),
      false,
    );
  };

  const handlePointerLeave = () => {
    if (!canHoverParallaxRef.current) return;
    cachedRectRef.current = null;
    applyParallax(0, 0, true);
  };

  return (
    <section
      id="home"
      aria-label="Home — Portfolio Hero"
      className="scroll-mt-14 sm:scroll-mt-[68px] border-b border-[var(--border-hairline)] overflow-hidden"
    >
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-[1.06fr_1fr] items-stretch">
        {/* LEFT COMPOSITION — Signature Typographic Canvas */}
        <div className="relative min-w-0 flex flex-col justify-between gap-10 sm:gap-12 px-4 sm:px-6 lg:px-10 pt-9 sm:pt-12 lg:pt-16 pb-9 sm:pb-12 lg:pb-14">
          {/* Dominant Oversized Name (Masked Line-by-Line Reveal) & Academic Headline */}
          <div className="min-w-0">
            <h1 className="font-display font-bold text-[var(--color-espresso-deep)] text-[clamp(2.75rem,8.4vw,6.85rem)] leading-[0.89] tracking-[-0.042em] break-words [overflow-wrap:anywhere] select-none">
              <span className="block overflow-hidden pb-1 -mb-1">
                <span className="hero-mask-line block">
                  {HERO_PROFILE.displayNameLine1}
                </span>
              </span>
              <span className="block overflow-hidden pb-2 -mb-2">
                <span
                  style={{ animationDelay: '70ms' }}
                  className="hero-mask-line inline-block"
                >
                  {HERO_PROFILE.displayNameLine2}
                  <span
                    aria-hidden="true"
                    style={{ animationDelay: '180ms' }}
                    className="hero-geo-reveal inline-block ml-2 sm:ml-3 w-3 h-3 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px] rounded-full bg-[var(--color-vermilion)] align-baseline"
                  />
                </span>
              </span>
            </h1>

            <p
              style={{ animationDelay: '120ms' }}
              className="hero-reveal-up mt-5 sm:mt-6 font-display text-base sm:text-lg lg:text-[21px] font-semibold text-[var(--color-espresso)] tracking-[-0.015em] max-w-xl text-balance break-words"
            >
              {HERO_PROFILE.headline}
            </p>
          </div>

          {/* Middle Asymmetric Band: Restrained Orange Semicircle + Verified Introduction */}
          <div className="relative flex flex-col gap-8 sm:gap-9">
            <div className="relative flex items-center gap-4 sm:gap-6">
              <div
                aria-hidden="true"
                style={{ animationDelay: '140ms' }}
                className="hero-slide-x -ml-4 sm:-ml-6 lg:-ml-10 w-7 h-14 sm:w-10 sm:h-20 lg:w-13 lg:h-26 rounded-r-full orange-panel-gradient shrink-0"
              />

              <div
                style={{ animationDelay: '180ms' }}
                className="hero-reveal-up min-w-0 pl-4 sm:pl-5 border-l-[1.5px] border-[var(--color-orange)] max-w-md"
              >
                <p className="text-sm sm:text-[15px] leading-[1.65] text-[var(--color-espresso)] break-words">
                  {HERO_PROFILE.introduction}
                </p>
              </div>
            </div>

            {/* Bottom Row: Primary & Secondary Actions + Balanced Vermilion Accent */}
            <div className="flex flex-wrap items-end justify-between gap-6 pt-1">
              <div
                style={{ animationDelay: '230ms' }}
                className="hero-reveal-up flex flex-wrap items-center gap-3 sm:gap-4"
              >
                <a
                  href={HERO_PROFILE.ctas.primary.href}
                  className="group inline-flex items-center gap-3 bg-[var(--color-espresso-deep)] text-[var(--color-cream)] pl-5 pr-2.5 py-2.5 min-h-[44px] text-xs font-display font-semibold tracking-[0.1em] uppercase transition-[background-color,transform,translate,scale,box-shadow] duration-250 ease-[var(--ease-editorial)] hover:bg-[var(--color-espresso)] hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(29,15,10,0.16)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-orange)] whitespace-nowrap shrink-0"
                >
                  <span>{HERO_PROFILE.ctas.primary.label}</span>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-orange)] text-[var(--color-cream)] transition-[transform,translate,background-color] duration-250 ease-[var(--ease-editorial)] group-hover:translate-x-1 group-hover:bg-[var(--color-orange-bright)]">
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.25} />
                  </span>
                </a>

                <a
                  href={HERO_PROFILE.ctas.secondary.href}
                  className="inline-flex items-center gap-2 border border-[var(--color-espresso)] text-[var(--color-espresso-deep)] px-5 py-2.5 min-h-[44px] text-xs font-display font-semibold tracking-[0.1em] uppercase transition-[background-color,color,transform,translate,scale,box-shadow] duration-250 ease-[var(--ease-editorial)] hover:bg-[var(--color-espresso)] hover:text-[var(--color-cream)] hover:-translate-y-[3px] hover:shadow-[0_8px_18px_rgba(29,15,10,0.12)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-orange)] whitespace-nowrap shrink-0"
                >
                  <span>{HERO_PROFILE.ctas.secondary.label}</span>
                </a>
              </div>

              <div aria-hidden="true" className="hidden sm:block shrink-0">
                <div
                  style={{ animationDelay: '280ms' }}
                  className="hero-geo-reveal w-14 h-14 lg:w-[68px] lg:h-[68px] rounded-full bg-[var(--color-vermilion)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COMPOSITION — Signature Upright Portrait & Editorial Geometric Layering */}
        <div
          ref={rightCanvasRef}
          onPointerEnter={handlePointerEnter}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="min-w-0 flex flex-col border-t lg:border-t-0 lg:border-l border-[var(--border-hairline)]"
        >
          <div className="relative bg-[var(--color-cream-tonal)]/45 flex-1 flex items-center justify-center px-5 sm:px-8 lg:px-10 py-10 sm:py-12 lg:py-14 overflow-hidden">
            {/* Asymmetric Matte Orange Architectural Block (Upper-Left) */}
            <div
              aria-hidden="true"
              className="hero-reveal-fade absolute top-0 left-0 w-[38%] sm:w-[40%] h-[54%] orange-panel-gradient pointer-events-none"
            />

            {/* Structural Espresso Grounding Block (Lower-Left) */}
            <div
              aria-hidden="true"
              style={{ animationDelay: '60ms' }}
              className="hero-reveal-fade absolute bottom-0 left-0 w-[22%] h-[28%] bg-[var(--color-espresso)] espresso-texture pointer-events-none"
            />

            {/* Open Warm Cream Diagonal Upper-Right Wedge */}
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 w-52 h-32 sm:w-68 sm:h-42 bg-[var(--color-cream)] pointer-events-none"
              style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
            />

            {/* Restrained Cobalt-Blue Quarter Circle (Lower-Right) */}
            <div
              aria-hidden="true"
              style={{ animationDelay: '180ms' }}
              className="hero-geo-reveal absolute bottom-0 right-0 w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-tl-full bg-[var(--color-cobalt)] pointer-events-none"
            />

            {/* Soft Warm Ambient Halo Behind Portrait (Feathered Radial Gradient, Zero Blur Filter Cost) */}
            <div
              ref={haloRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div
                className="w-[86%] max-w-[600px] aspect-[16/9] rounded-full opacity-80"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 50%, rgba(238, 109, 13, 0.14) 0%, rgba(245, 226, 206, 0.42) 45%, rgba(245, 226, 206, 0.12) 66%, transparent 82%)',
                }}
              />
            </div>

            {/* Subtle Desktop Pointer Parallax Container */}
            <div
              ref={frameRef}
              className="relative z-10 w-full flex items-center justify-center"
            >
              {/* Centered Editorial Mat Frame Matched to Upright Portrait Proportions (16:9) */}
              <div className="group/portrait hero-portrait-clip w-full max-w-[460px] sm:max-w-[540px] lg:max-w-[580px] portrait-stone-surface border border-[var(--color-espresso)]/25 hover:border-[var(--color-espresso)]/40 ring-1 ring-inset ring-[var(--color-cream)]/70 shadow-[0_16px_40px_rgba(29,15,10,0.11)] hover:shadow-[0_24px_54px_rgba(29,15,10,0.15)] p-2.5 sm:p-3.5 transition-[transform,scale,box-shadow,border-color] duration-300 ease-[var(--ease-editorial)] hover:scale-[1.01]">
                <div className="relative w-full aspect-[16/9] border border-[var(--color-espresso)]/18 bg-[var(--color-cream)] flex items-center justify-center overflow-hidden">
                  {showPortraitImage ? (
                    <>
                      <picture className="block w-full h-full">
                        <source
                          type="image/webp"
                          srcSet={HERO_PROFILE.portraitSrcSet}
                          sizes={HERO_PROFILE.portraitSizes}
                        />
                        <img
                          src={HERO_PROFILE.portraitUrl}
                          alt={HERO_PROFILE.portraitAlt}
                          width={HERO_PROFILE.portraitWidth}
                          height={HERO_PROFILE.portraitHeight}
                          loading="eager"
                          decoding="async"
                          fetchPriority="high"
                          onError={() => setImageFailed(true)}
                          className="block w-full h-full object-contain object-center transition-[transform,scale] duration-350 ease-[var(--ease-editorial)] group-hover/portrait:scale-[1.015]"
                        />
                      </picture>

                      {/* Initial Controlled Warm Light Sweep (Passes once softly, never obscures face) */}
                      <div
                        aria-hidden="true"
                        className="hero-light-sweep pointer-events-none absolute inset-y-0 -left-1/2 w-[55%] skew-x-[-18deg]"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent 0%, rgba(251, 236, 220, 0.22) 48%, rgba(238, 109, 13, 0.06) 60%, transparent 100%)',
                        }}
                      />

                      {/* Subtle Intentional Hover Edge-Lit Reflection */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover/portrait:opacity-100 transition-opacity duration-400 ease-[var(--ease-editorial)]"
                        style={{
                          background:
                            'linear-gradient(125deg, rgba(251, 236, 220, 0.16) 0%, transparent 45%, rgba(238, 109, 13, 0.05) 100%)',
                        }}
                      />
                    </>
                  ) : (
                    <div
                      role="img"
                      aria-label="Portrait photograph placeholder"
                      className="w-full h-full flex items-center justify-center"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stationary Bottom Split Architecture — Espresso Identity Bar + Vermilion Accent */}
          <div className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_132px] min-h-[104px] sm:min-h-[124px] border-t border-[var(--border-hairline)]">
            <div
              style={{ animationDelay: '140ms' }}
              className="hero-reveal-fade min-w-0 bg-[var(--color-espresso)] espresso-texture text-[var(--color-cream)] px-4 sm:px-7 py-5 flex flex-col justify-center"
            >
              <p className="font-display text-sm sm:text-base font-bold tracking-[0.06em] uppercase break-words">
                {HERO_PROFILE.academicBar.status}
              </p>
              <p className="mt-1.5 text-xs tracking-[0.08em] uppercase text-[var(--color-cream)]/85 break-words">
                {HERO_PROFILE.academicBar.specialisation}
              </p>
            </div>

            <div
              aria-hidden="true"
              style={{ animationDelay: '180ms' }}
              className="hero-reveal-fade bg-[var(--color-vermilion)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
});
