import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { useGetHero } from "@workspace/api-client-react";

const HERO_BG =
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=80";

// Spring used for the main expansion — weighted, cinematic feel
const EXPAND_SPRING = { stiffness: 120, damping: 24, mass: 1.1 };

export function Hero() {
  const { lang } = useLanguage();
  const { data: heroContent } = useGetHero();

  const effectsEnabled = heroContent?.effectsEnabled !== false;
  const videoUrl = heroContent?.videoUrl ?? null;
  const fallbackImageUrl = heroContent?.fallbackImageUrl ?? null;
  const hasMedia = !!(videoUrl || fallbackImageUrl);

  // ─────────────────────────────────────────────────────────────
  // Core animation driver: `expansion` goes 0 (rest) → 1 (full takeover)
  //
  // The absolute video layer uses clip-path to define its visible region.
  // At rest it is clipped to the right-column area.
  // On hover of the right half it opens to cover the full hero section.
  // Every animated property derives from this single spring value.
  // ─────────────────────────────────────────────────────────────
  const expansionRaw = useMotionValue(0);
  const expansion = useSpring(expansionRaw, EXPAND_SPRING);

  // clip-path: at rest reveals an oval/pill in the bottom-right column area.
  // Large radius (9999px) collapses to pill/capsule shape regardless of size.
  // On hover the insets sweep to 0 and radius drops to 0 (full section reveal).
  // inset(top right bottom left round radius)
  const insetTop    = useTransform(expansion, [0, 1], [48, 0]);   // % — bottom-right quarter
  const insetRight  = useTransform(expansion, [0, 1], [3,  0]);   // %
  const insetBottom = useTransform(expansion, [0, 1], [0,  0]);   // % — flush with bottom edge
  const insetLeft   = useTransform(expansion, [0, 1], [72, 0]);   // % — ~25% section width
  const radius      = useTransform(expansion, [0, 1], [9999, 0]); // px → pill at rest, sharp on expand
  const videoClip   = useMotionTemplate`inset(${insetTop}% ${insetRight}% ${insetBottom}% ${insetLeft}% round ${radius}px)`;

  // Left text column — slides left and fades as video expands
  const textX       = useTransform(expansion, [0, 0.6], [0, -80]); // px
  const textOpacity = useTransform(expansion, [0, 0.5], [1, 0]);

  // Right preview card — fades as the absolute layer blooms over it
  const previewOpacity = useTransform(expansion, [0, 0.4], [1, 0]);

  // Dark gradient overlay on the expanded video — keeps the section readable
  const overlayOpacity = useTransform(expansion, [0, 1], [0, 0.38]);

  // Scroll hint dims while expanded
  const scrollOpacity = useTransform(expansion, [0, 0.5], [1, 0]);

  // ─────────────────────────────────────────────────────────────
  // Mouse tracking — trigger expansion when cursor is in right half
  // ─────────────────────────────────────────────────────────────
  const handleSectionMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!effectsEnabled || !hasMedia) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    // Activate when cursor reaches the right quarter where the oval sits
    expansionRaw.set(relX > 0.62 ? 1 : 0);
  };

  const handleSectionLeave = () => expansionRaw.set(0);

  // ─────────────────────────────────────────────────────────────
  // Localised content
  // ─────────────────────────────────────────────────────────────
  const title =
    heroContent
      ? (lang === "ru" ? heroContent.titleRu : lang === "tj" ? heroContent.titleTj : null) ??
        heroContent.titleEn
      : null;

  const subtitle =
    heroContent
      ? (lang === "ru"
          ? heroContent.subtitleRu
          : lang === "tj"
          ? heroContent.subtitleTj
          : heroContent.subtitleEn) ?? null
      : null;

  const ctaPrimaryLabel =
    heroContent
      ? (lang === "ru" ? heroContent.ctaPrimaryLabelRu : lang === "tj" ? heroContent.ctaPrimaryLabelTj : null) ??
        heroContent.ctaPrimaryLabel ?? null
      : null;

  const ctaSecondaryLabel =
    heroContent
      ? (lang === "ru" ? heroContent.ctaSecondaryLabelRu : lang === "tj" ? heroContent.ctaSecondaryLabelTj : null) ??
        heroContent.ctaSecondaryLabel ?? null
      : null;

  const ctaPrimaryHref  = heroContent?.ctaPrimaryHref  ?? "#portfolio";
  const ctaSecondaryHref = heroContent?.ctaSecondaryHref ?? "#about";

  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  const handleCta = (href: string) =>
    href.startsWith("#") ? scrollTo(href) : (window.location.href = href);

  const styledHeadline = <>Tasvirnigor</>;

  const stats = [
    { num: "10+", label: lang === "ru" ? "Лет"      : lang === "tj" ? "Сол"    : "Years"    },
    { num: "40+", label: lang === "ru" ? "Проектов" : lang === "tj" ? "Лоиҳа"  : "Projects" },
    { num: "20+", label: lang === "ru" ? "Стран"    : lang === "tj" ? "Кишвар" : "Countries" },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex items-center overflow-hidden from-[#1E4A5E] to-[#0E2A38] bg-[#000000]"
      onMouseMove={handleSectionMove}
      onMouseLeave={handleSectionLeave}
    >
      {/* ── Absolute full-hero video layer ─────────────────────────
           Always inset-0. Clip-path controls what's visible.
           At rest: shows only the right column area.
           On hover of right half: expands to fill the entire section.
      ─────────────────────────────────────────────────────────── */}
      {hasMedia && (
        <motion.div
          className="absolute inset-0 z-[8] bg-[#1E4A5E]"
          style={{
            clipPath: effectsEnabled ? videoClip : undefined,
            willChange: "clip-path",
          }}
        >
          {videoUrl ? (
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-contain bg-[#0a0a08] text-[#141414] border-r-[30px]"
              poster={fallbackImageUrl ?? undefined}
            />
          ) : (
            <img
              src={fallbackImageUrl!}
              alt="Tasvirnigor Studio"
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}

          {/* Overlay gradient — darkens expanded video subtly */}
          <motion.div
            className="absolute inset-0 bg-black pointer-events-none"
            style={{ opacity: overlayOpacity }}
          />

          {/* Cinematic gradient at bottom edge for grounding */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0E2A38] to-transparent pointer-events-none" />
        </motion.div>
      )}
      {/* Ambient golden radial glows (atmospheric cinema lighting) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[6]">
        {/* Primary warm accent — upper right */}
        <div
          className="absolute top-1/2 left-[84%] -translate-x-1/2 -translate-y-1/2 w-[42vw] h-[72vh] rounded-full"
          style={{
            background: "radial-gradient(circle, #FAB037 0%, transparent 65%)",
            opacity: 0.12,
          }}
        />
        {/* Secondary fill glow — lower left for depth */}
        <div
          className="absolute bottom-[12%] left-[6%] w-[28vw] h-[35vh] rounded-full"
          style={{
            background: "radial-gradient(circle, #FAB037 0%, transparent 70%)",
            opacity: 0.06,
          }}
        />
      </div>
      {/* Static BG when no media */}
      {!hasMedia && (
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_BG}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-[0.18]"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E4A5E]/95 via-[#1E4A5E]/65 to-[#1E4A5E]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E2A38]/70 via-transparent to-transparent" />
        </div>
      )}
      {/* ── Main grid content ────────────────────────────────────── */}
      <div
        className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10 w-full pt-28 pb-24
                   flex flex-col justify-center min-h-[100dvh]"
      >
        {/* LEFT: text — slides away as video takes over */}
        <motion.div
          className="flex flex-col justify-center"
          style={
            effectsEnabled
              ? { x: textX, opacity: textOpacity }
              : undefined
          }
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="section-label mb-6 text-[19px]"
          >
            {t(i18n.hero.tagline, lang)}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="font-display font-extrabold text-white leading-[0.93] tracking-tight mb-7"
            style={{ fontSize: "clamp(2.7rem, 6.5vw, 5.6rem)" }}
          >
            {title ?? styledHeadline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-white/55 font-light text-base md:text-lg max-w-xl leading-relaxed mb-10"
          >
            {subtitle ?? t(i18n.hero.subtitle, lang)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={() => handleCta(ctaPrimaryHref)}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-primary text-white
                         font-semibold text-sm hover:bg-primary/90 hover:gap-3.5
                         hover:shadow-[0_0_28px_rgba(250,176,55,0.38)]
                         transition-all duration-[350ms] ease-out"
            >
              {ctaPrimaryLabel ?? t(i18n.hero.cta, lang)}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCta(ctaSecondaryHref)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/25
                         text-white/80 font-medium text-sm
                         hover:border-[#FAB037]/50 hover:text-white
                         hover:shadow-[0_0_20px_rgba(250,176,55,0.18)]
                         transition-all duration-[350ms] ease-out"
            >
              {ctaSecondaryLabel ?? t(i18n.nav.about, lang)}
            </button>
          </motion.div>

          {/* Mobile: simple embedded video */}
          {hasMedia && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="lg:hidden mt-8 relative rounded-2xl overflow-hidden"
              style={{ aspectRatio: "16/9" }}
            >
              {videoUrl ? (
                <video
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  poster={fallbackImageUrl ?? undefined}
                />
              ) : (
                <img
                  src={fallbackImageUrl!}
                  alt="Tasvirnigor Studio"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          )}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.75 }}
            className="hidden lg:flex items-center gap-8 mt-14 pt-10 border-t border-white/[0.07]"
          >
            {stats.map(({ num, label }) => (
              <div key={num} className="flex flex-col gap-0.5">
                <span className="font-display font-bold text-[1.75rem] text-primary leading-none">{num}</span>
                <span className="text-white/35 text-[10px] tracking-[0.18em] uppercase">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

      </div>
      {/* ── Oval decoration — bottom-right, absolute — fades as video expands ── */}
      {hasMedia && (
        <motion.div
          className="absolute hidden lg:block z-20 pointer-events-none"
          style={{
            bottom: 0,
            right: "3%",
            width: "25%",
            aspectRatio: "2/3",
            ...(effectsEnabled ? { opacity: previewOpacity } : {}),
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Amber glow halo */}
          <div
            className="absolute inset-[-18px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, hsl(38 82% 42% / 0.18) 0%, transparent 70%)",
              filter: "blur(24px)",
            }}
          />
          {/* Pill frame */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden"
            style={{
              border: "1px solid hsl(38 82% 42% / 0.22)",
              boxShadow:
                "0 0 60px 8px hsl(38 82% 42% / 0.12), inset 0 0 40px hsl(38 82% 42% / 0.04), 0 32px 80px rgba(0,0,0,0.5)",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 60%)",
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 10%, hsl(38 82% 42% / 0.35) 50%, transparent 90%)",
              }}
            />
          </div>
        </motion.div>
      )}
      {/* Scroll indicator */}
      <motion.button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2
                   text-white/35 hover:text-white/65 transition-colors duration-200"
        style={effectsEnabled ? { opacity: scrollOpacity } : undefined}
        animate={{ y: [0, 7, 0] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        onClick={() => scrollTo("#about")}
      >
        <span className="text-[10px] tracking-[0.2em] uppercase font-medium">
          {t(i18n.hero.scroll, lang)}
        </span>
        <ArrowDown className="w-4 h-4" />
      </motion.button>
    </section>
  );
}
