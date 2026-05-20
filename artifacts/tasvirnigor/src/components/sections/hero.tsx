import { useRef } from "react";
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

// Springs
const PROXIMITY_SPRING = { stiffness: 130, damping: 22, mass: 0.7 };
const PARALLAX_SPRING = { stiffness: 70, damping: 20 };

export function Hero() {
  const { lang } = useLanguage();
  const { data: heroContent } = useGetHero();

  const effectsEnabled = heroContent?.effectsEnabled !== false;
  const videoUrl = heroContent?.videoUrl ?? null;
  const fallbackImageUrl = heroContent?.fallbackImageUrl ?? null;
  const hasMedia = !!(videoUrl || fallbackImageUrl);

  // ─────────────────────────────────────────────────────────────
  // Cursor-proximity model
  //
  // `proximity` is 0 when the cursor is far from the video, smoothly
  // approaches 1 as it nears the video frame center, and saturates at
  // 1 when directly over it. Every animated property below derives
  // from a spring-smoothed version of this single value.
  // ─────────────────────────────────────────────────────────────
  const videoFrameRef = useRef<HTMLDivElement>(null);

  const proximityRaw = useMotionValue(0);
  const proximity = useSpring(proximityRaw, PROXIMITY_SPRING);

  // Drives the cinematic transform of the video frame itself
  const frameScale = useTransform(proximity, [0, 1], [1, 1.5]);
  const insetH = useTransform(proximity, [0, 1], [7, -9]); // %
  const insetV = useTransform(proximity, [0, 1], [6, -9]); // %
  const radius = useTransform(proximity, [0, 1], [38, 4]); // px
  const clipPath = useMotionTemplate`inset(${insetV}% ${insetH}% ${insetV}% ${insetH}% round ${radius}px)`;

  // Glow halo around the video
  const glowOpacity = useTransform(proximity, [0, 1], [0.05, 0.28]);
  const glowScale = useTransform(proximity, [0, 1], [1, 1.4]);
  const glowBlur = useTransform(proximity, [0, 1], [60, 130]); // px

  // Section dim — quietly veils the rest of the section
  const dimOpacity = useTransform(proximity, [0, 1], [0, 0.45]);

  // Text counter-parallax — shifts left and softens as video grows toward it
  const textShiftX = useTransform(proximity, [0, 1], [0, -36]);
  const textOpacity = useTransform(proximity, [0, 1], [1, 0.5]);

  // Corner brackets vanish quickly once expansion begins
  const cornerOpacity = useTransform(proximity, [0, 0.25], [1, 0]);

  // Subtle parallax drift of the video frame, tracking cursor like a magnet
  const parallaxXRaw = useMotionValue(0);
  const parallaxYRaw = useMotionValue(0);
  const parallaxX = useSpring(parallaxXRaw, PARALLAX_SPRING);
  const parallaxY = useSpring(parallaxYRaw, PARALLAX_SPRING);

  // ─────────────────────────────────────────────────────────────
  // Mouse handler — computes proximity from cursor distance to video
  // center, normalized by the frame's own width.
  // ─────────────────────────────────────────────────────────────
  const handleSectionMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!effectsEnabled || !hasMedia) return;
    const frameEl = videoFrameRef.current;
    if (!frameEl) return;

    const r = frameEl.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    // Distance normalized by frame width (so reach is consistent across viewports)
    const dx = (e.clientX - cx) / r.width;
    const dy = (e.clientY - cy) / r.width;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Falloff: full strength at center (dist=0), zero at ~1.4 widths away
    // Exponential curve makes the approach feel snappier near the frame.
    const REACH = 1.4;
    const t = Math.max(0, 1 - Math.min(dist, REACH) / REACH);
    const p = Math.pow(t, 1.6);
    proximityRaw.set(p);

    // Magnetic drift: cursor pulls the frame slightly toward it
    parallaxXRaw.set(dx * r.width * 0.045);
    parallaxYRaw.set(dy * r.width * 0.045);
  };

  const handleSectionLeave = () => {
    proximityRaw.set(0);
    parallaxXRaw.set(0);
    parallaxYRaw.set(0);
  };

  // ─────────────────────────────────────────────────────────────
  // Localised content
  // ─────────────────────────────────────────────────────────────
  const title =
    heroContent
      ? (lang === "ru"
          ? heroContent.titleRu
          : lang === "tj"
          ? heroContent.titleTj
          : null) ?? heroContent.titleEn
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
      ? (lang === "ru"
          ? heroContent.ctaPrimaryLabelRu
          : lang === "tj"
          ? heroContent.ctaPrimaryLabelTj
          : null) ?? heroContent.ctaPrimaryLabel ?? null
      : null;

  const ctaSecondaryLabel =
    heroContent
      ? (lang === "ru"
          ? heroContent.ctaSecondaryLabelRu
          : lang === "tj"
          ? heroContent.ctaSecondaryLabelTj
          : null) ?? heroContent.ctaSecondaryLabel ?? null
      : null;

  const ctaPrimaryHref = heroContent?.ctaPrimaryHref ?? "#portfolio";
  const ctaSecondaryHref = heroContent?.ctaSecondaryHref ?? "#about";

  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  const handleCta = (href: string) =>
    href.startsWith("#") ? scrollTo(href) : (window.location.href = href);

  const styledHeadline =
    lang === "ru" ? (
      <>
        Кино и <span className="text-primary">анимация</span> из Таджикистана
      </>
    ) : lang === "tj" ? (
      <>
        Кино ва <span className="text-primary">анимация</span> аз Тоҷикистон
      </>
    ) : (
      <>
        Film & <span className="text-primary">Animation</span> from Tajikistan
      </>
    );

  const stats = [
    { num: "10+", label: lang === "ru" ? "Лет" : lang === "tj" ? "Сол" : "Years" },
    { num: "40+", label: lang === "ru" ? "Проектов" : lang === "tj" ? "Лоиҳа" : "Projects" },
    { num: "20+", label: lang === "ru" ? "Стран" : lang === "tj" ? "Кишвар" : "Countries" },
  ];

  // Build animated box-shadow string from motion values
  const boxShadow = useMotionTemplate`0 0 ${glowBlur}px ${useTransform(
    glowBlur,
    (b) => b / 3
  )}px rgba(196,145,10,${glowOpacity}), 0 30px 90px rgba(0,0,0,0.6)`;

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex items-center overflow-hidden bg-[#080808]"
      onMouseMove={handleSectionMove}
      onMouseLeave={handleSectionLeave}
    >
      {/* Ambient amber radial — pulses with proximity */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsl(38 82% 42%) 0%, transparent 65%)",
            opacity: glowOpacity,
            scale: glowScale,
          }}
        />
      </div>

      {/* Section dim — focuses attention on the video */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none z-[5]"
        style={{ opacity: dimOpacity }}
      />

      {/* Static BG fallback when no custom media uploaded */}
      {!hasMedia && (
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_BG}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-[0.18]"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/95 via-[#080808]/65 to-[#080808]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/70 via-transparent to-transparent" />
        </div>
      )}

      {/* Main grid */}
      <div
        className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10 w-full pt-28 pb-24
                   grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16
                   items-center min-h-[100dvh]"
      >
        {/* ── LEFT: Text — drifts left & softens as video grows ──── */}
        <motion.div
          className="flex flex-col justify-center"
          style={
            effectsEnabled
              ? { x: textShiftX, opacity: textOpacity }
              : undefined
          }
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-primary font-semibold tracking-[0.22em] uppercase text-xs mb-6"
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
                         font-semibold text-sm hover:bg-primary/90 transition-all duration-200 hover:gap-3.5"
            >
              {ctaPrimaryLabel ?? t(i18n.hero.cta, lang)}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCta(ctaSecondaryHref)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/25
                         text-white/80 font-medium text-sm hover:border-white/50 hover:text-white
                         transition-all duration-200"
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
                <span className="font-display font-bold text-[1.75rem] text-primary leading-none">
                  {num}
                </span>
                <span className="text-white/35 text-[10px] tracking-[0.18em] uppercase">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── RIGHT: Cinematic video frame (desktop) ───────────────── */}
        {hasMedia && (
          <motion.div
            className="relative hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ zIndex: 20 }}
          >
            {/* Animated amber glow halo */}
            <motion.div
              className="absolute inset-[-30px] rounded-[60px] pointer-events-none"
              style={{ boxShadow }}
            />

            {/* The video frame itself — scales dramatically with proximity */}
            <motion.div
              ref={videoFrameRef}
              className="relative w-full overflow-hidden"
              style={{
                aspectRatio: "10/13",
                maxHeight: "70vh",
                scale: effectsEnabled ? frameScale : 1,
                clipPath: effectsEnabled ? clipPath : undefined,
                x: effectsEnabled ? parallaxX : 0,
                y: effectsEnabled ? parallaxY : 0,
                willChange: "transform, clip-path",
                transformOrigin: "center center",
              }}
            >
              {/* Media */}
              {videoUrl ? (
                <video
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  poster={fallbackImageUrl ?? undefined}
                  style={{ willChange: "transform" }}
                />
              ) : (
                <img
                  src={fallbackImageUrl!}
                  alt="Tasvirnigor Studio"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ willChange: "transform" }}
                />
              )}

              {/* Cinematic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 pointer-events-none" />

              {/* Corner marks — fade away the moment expansion begins */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: cornerOpacity }}
              >
                <div className="absolute top-4 left-4 w-5 h-5 border-t-[1.5px] border-l-[1.5px] border-white/30" />
                <div className="absolute top-4 right-4 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-white/30" />
                <div className="absolute bottom-4 left-4 w-5 h-5 border-b-[1.5px] border-l-[1.5px] border-white/30" />
                <div className="absolute bottom-4 right-4 w-5 h-5 border-b-[1.5px] border-r-[1.5px] border-white/30" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2
                   text-white/35 hover:text-white/65 transition-colors duration-200"
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
