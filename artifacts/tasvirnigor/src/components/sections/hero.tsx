import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowRight, Play, X, Maximize2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { useGetHero } from "@workspace/api-client-react";

const HERO_BG = "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=80";

// Spring configs — different feel for different interactions
const HOVER_SPRING = { type: "spring" as const, damping: 24, stiffness: 200, mass: 0.8 };
const PARALLAX_SPRING = { stiffness: 50, damping: 20 };
const FULLSCREEN_SPRING = { type: "spring" as const, damping: 28, stiffness: 220, mass: 0.7 };

export function Hero() {
  const { lang } = useLanguage();
  const { data: heroContent } = useGetHero();

  const [hovered, setHovered] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Section-wide cursor parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, PARALLAX_SPRING);
  const springY = useSpring(mouseY, PARALLAX_SPRING);

  const effectsEnabled = heroContent?.effectsEnabled !== false;
  const videoUrl = heroContent?.videoUrl ?? null;
  const fallbackImageUrl = heroContent?.fallbackImageUrl ?? null;
  const hasMedia = !!(videoUrl || fallbackImageUrl);

  // Localised content
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
        heroContent.ctaPrimaryLabel ??
        null
      : null;

  const ctaSecondaryLabel =
    heroContent
      ? (lang === "ru" ? heroContent.ctaSecondaryLabelRu : lang === "tj" ? heroContent.ctaSecondaryLabelTj : null) ??
        heroContent.ctaSecondaryLabel ??
        null
      : null;

  const ctaPrimaryHref = heroContent?.ctaPrimaryHref ?? "#portfolio";
  const ctaSecondaryHref = heroContent?.ctaSecondaryHref ?? "#about";

  // ESC to close fullscreen
  const closeFullscreen = useCallback(() => setFullscreen(false), []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFullscreen();
    };
    window.addEventListener("keydown", onKey);
    // Prevent body scroll when fullscreen
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [fullscreen, closeFullscreen]);

  const handleSectionMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!effectsEnabled || fullscreen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // Stronger parallax when video is hovered
    const strength = hovered ? 0.045 : 0.022;
    mouseX.set((e.clientX - rect.left - rect.width / 2) * strength);
    mouseY.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const handleSectionMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  };

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCtaClick = (href: string) => {
    if (href.startsWith("#")) scrollTo(href);
    else window.location.href = href;
  };

  const styledHeadline =
    lang === "ru" ? (
      <>Кино и <span className="text-primary">анимация</span> из Таджикистана</>
    ) : lang === "tj" ? (
      <>Кино ва <span className="text-primary">анимация</span> аз Тоҷикистон</>
    ) : (
      <>Film & <span className="text-primary">Animation</span> from Tajikistan</>
    );

  const stats = [
    { num: "10+", label: lang === "ru" ? "Лет" : lang === "tj" ? "Сол" : "Years" },
    { num: "40+", label: lang === "ru" ? "Проектов" : lang === "tj" ? "Лоиҳа" : "Projects" },
    { num: "20+", label: lang === "ru" ? "Стран" : lang === "tj" ? "Кишвар" : "Countries" },
  ];

  const closeLabelMap = { ru: "Закрыть", tj: "Пӯшидан", en: "Close" } as const;
  const closeLabel = closeLabelMap[lang as keyof typeof closeLabelMap] ?? closeLabelMap.en;

  const expandLabelMap = {
    ru: "Нажмите для просмотра",
    tj: "Барои дидан клик кунед",
    en: "Click to watch",
  } as const;
  const expandLabel = expandLabelMap[lang as keyof typeof expandLabelMap] ?? expandLabelMap.en;

  return (
    <>
      <section
        id="hero"
        className="relative min-h-[100dvh] flex items-center overflow-hidden bg-[#080808]"
        onMouseMove={handleSectionMouseMove}
        onMouseLeave={handleSectionMouseLeave}
      >
        {/* Ambient radial glow — shifts when hovered */}
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          animate={{ opacity: hovered ? 1.4 : 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="absolute top-1/2 left-[55%] -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(38 82% 42%) 0%, transparent 65%)",
            }}
            animate={{ opacity: hovered ? 0.13 : 0.065, scale: hovered ? 1.15 : 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </motion.div>

        {/* Background dim — fades in when video is hovered */}
        <AnimatePresence>
          {hovered && hasMedia && (
            <motion.div
              className="absolute inset-0 bg-black pointer-events-none z-[6]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.28 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        {/* Static BG when no custom media */}
        {!hasMedia && (
          <div className="absolute inset-0 z-0">
            <img
              src={HERO_BG}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-18"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/95 via-[#080808]/65 to-[#080808]/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/70 via-transparent to-transparent" />
          </div>
        )}

        {/* Main layout */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10 w-full pt-28 pb-24 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16 items-center min-h-[100dvh]">

          {/* ── LEFT: Text ──────────────────────────────────────────── */}
          <div className="flex flex-col justify-center">
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
                onClick={() => handleCtaClick(ctaPrimaryHref)}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all duration-200 hover:gap-3.5"
              >
                {ctaPrimaryLabel ?? t(i18n.hero.cta, lang)}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCtaClick(ctaSecondaryHref)}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/25 text-white/80 font-medium text-sm hover:border-white/50 hover:text-white transition-all duration-200"
              >
                {ctaSecondaryLabel ?? t(i18n.nav.about, lang)}
              </button>
            </motion.div>

            {/* Mobile video preview — tap to fullscreen */}
            {hasMedia && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.65 }}
                className="lg:hidden mt-8 relative rounded-2xl overflow-hidden cursor-pointer group"
                style={{ aspectRatio: "16/9" }}
                onClick={() => setFullscreen(true)}
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
                  <img src={fallbackImageUrl!} alt="Tasvirnigor Studio" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stats row */}
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
          </div>

          {/* ── RIGHT: Cinematic video preview (desktop) ────────────── */}
          {hasMedia && (
            <motion.div
              className="relative hidden lg:flex items-center justify-center"
              style={{ x: effectsEnabled ? springX : 0, y: effectsEnabled ? springY : 0 }}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Animated glow ring — intensifies on hover */}
              <motion.div
                className="absolute inset-[-20px] rounded-[52px] pointer-events-none"
                animate={{
                  boxShadow: hovered
                    ? "0 0 140px 50px rgba(196,145,10,0.18), 0 40px 100px rgba(0,0,0,0.7)"
                    : "0 0 90px 25px rgba(196,145,10,0.07), 0 20px 60px rgba(0,0,0,0.4)",
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />

              {/* Clipped media frame */}
              <motion.div
                className="relative overflow-hidden w-full cursor-pointer"
                style={{ aspectRatio: "10/13", maxHeight: "70vh" }}
                animate={{
                  clipPath: hovered && effectsEnabled
                    ? "inset(0% 0% 0% 0% round 6px)"
                    : "inset(4% 5% 4% 5% round 32px)",
                  scale: hovered && effectsEnabled ? 1.08 : 1,
                }}
                transition={HOVER_SPRING}
                onHoverStart={() => effectsEnabled && setHovered(true)}
                onHoverEnd={() => effectsEnabled && setHovered(false)}
                onClick={() => setFullscreen(true)}
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
                  <img src={fallbackImageUrl!} alt="Tasvirnigor Studio" className="w-full h-full object-cover" />
                )}

                {/* Cinematic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

                {/* Hover overlay: play/expand button */}
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  animate={{ opacity: hovered ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Icon */}
                  <motion.div
                    className="w-16 h-16 rounded-full bg-black/35 backdrop-blur-md border border-white/25 flex items-center justify-center"
                    animate={{ scale: hovered ? 1 : 0.85 }}
                    transition={HOVER_SPRING}
                  >
                    {videoUrl
                      ? <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
                      : <Maximize2 className="w-5 h-5 text-white" />
                    }
                  </motion.div>
                  {/* Label */}
                  <motion.span
                    className="text-[9px] tracking-[0.25em] uppercase text-white/50 font-medium"
                    animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                  >
                    {expandLabel}
                  </motion.span>
                </motion.div>

                {/* Corner frame marks — hide on hover for cleaner look */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{ opacity: hovered ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute top-4 left-4 w-5 h-5 border-t-[1.5px] border-l-[1.5px] border-white/20" />
                  <div className="absolute top-4 right-4 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-white/20" />
                  <div className="absolute bottom-4 left-4 w-5 h-5 border-b-[1.5px] border-l-[1.5px] border-white/20" />
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b-[1.5px] border-r-[1.5px] border-white/20" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Scroll indicator */}
        <motion.button
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/35 hover:text-white/65 transition-colors duration-200"
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          onClick={() => scrollTo("#about")}
        >
          <span className="text-[10px] tracking-[0.2em] uppercase font-medium">{t(i18n.hero.scroll, lang)}</span>
          <ArrowDown className="w-4 h-4" />
        </motion.button>
      </section>

      {/* ── Fullscreen video portal ────────────────────────────────────── */}
      {hasMedia && createPortal(
        <AnimatePresence>
          {fullscreen && (
            <>
              {/* Scrim */}
              <motion.div
                className="fixed inset-0 z-[299] bg-black/95 cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                onClick={closeFullscreen}
              />

              {/* Video container */}
              <motion.div
                className="fixed inset-0 z-[300] flex flex-col items-center justify-center px-4 py-6 lg:px-12 lg:py-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Close row */}
                <motion.div
                  className="w-full max-w-[90vw] lg:max-w-[82vw] flex items-center justify-between mb-4"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <span className="text-white/40 text-xs tracking-[0.2em] uppercase font-medium">
                    Tasvirnigor Studio
                  </span>
                  <button
                    onClick={closeFullscreen}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-200 group"
                  >
                    <span className="text-[10px] tracking-[0.18em] uppercase hidden sm:block">{closeLabel}</span>
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition-colors duration-200">
                      <X className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </motion.div>

                {/* Media frame */}
                <motion.div
                  className="relative w-full max-w-[90vw] lg:max-w-[82vw] rounded-lg overflow-hidden"
                  style={{ aspectRatio: videoUrl ? "16/9" : "4/3" }}
                  initial={{ scale: 0.72, opacity: 0, y: 28 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.86, opacity: 0, y: 16 }}
                  transition={FULLSCREEN_SPRING}
                >
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      autoPlay
                      controls
                      loop
                      playsInline
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <img
                      src={fallbackImageUrl!}
                      alt="Tasvirnigor Studio"
                      className="w-full h-full object-contain bg-black"
                    />
                  )}

                  {/* Subtle vignette */}
                  <div className="absolute inset-0 pointer-events-none rounded-lg"
                    style={{ boxShadow: "inset 0 0 80px rgba(0,0,0,0.3)" }} />
                </motion.div>

                {/* ESC hint */}
                <motion.p
                  className="mt-5 text-white/20 text-[10px] tracking-[0.2em] uppercase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  ESC · {closeLabel}
                </motion.p>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
