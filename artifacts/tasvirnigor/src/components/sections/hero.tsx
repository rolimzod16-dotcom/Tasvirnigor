import { useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowRight, Play, X } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { useGetHero } from "@workspace/api-client-react";

const HERO_BG = "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=80";

export function Hero() {
  const { lang } = useLanguage();
  const { data: heroContent } = useGetHero();
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 55, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 55, damping: 22 });

  const effectsEnabled = heroContent?.effectsEnabled !== false;
  const videoUrl = heroContent?.videoUrl ?? null;
  const fallbackImageUrl = heroContent?.fallbackImageUrl ?? null;
  const hasMedia = !!(videoUrl || fallbackImageUrl);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!effectsEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) * 0.025);
    mouseY.set((e.clientY - rect.top - rect.height / 2) * 0.025);
  };

  const handleMouseLeave = () => {
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

  const expandHint =
    lang === "ru"
      ? "Нажмите для расширения"
      : lang === "tj"
      ? "Барои васеъ кардан клик кунед"
      : "Click to expand";

  const stats = [
    {
      num: "10+",
      label: lang === "ru" ? "Лет" : lang === "tj" ? "Сол" : "Years",
    },
    {
      num: "40+",
      label: lang === "ru" ? "Проектов" : lang === "tj" ? "Лоиҳа" : "Projects",
    },
    {
      num: "20+",
      label: lang === "ru" ? "Стран" : lang === "tj" ? "Кишвар" : "Countries",
    },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex items-center overflow-hidden bg-[#080808]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient radial glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-[55%] -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] rounded-full opacity-[0.065]"
          style={{
            background:
              "radial-gradient(circle, hsl(38 82% 42%) 0%, transparent 65%)",
          }}
        />
      </div>

      {/* Static BG overlay when no custom media */}
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

      {/* Main two-column layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10 w-full pt-28 pb-24 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16 items-center min-h-[100dvh]">

        {/* ── LEFT: Text content ────────────────────────────────── */}
        <div className="flex flex-col justify-center">

          {/* Studio tagline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-primary font-semibold tracking-[0.22em] uppercase text-xs mb-6"
          >
            {t(i18n.hero.tagline, lang)}
          </motion.p>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="font-display font-extrabold text-white leading-[0.93] tracking-tight mb-7"
            style={{ fontSize: "clamp(2.7rem, 6.5vw, 5.6rem)" }}
          >
            {title ?? styledHeadline}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-white/55 font-light text-base md:text-lg max-w-xl leading-relaxed mb-10"
          >
            {subtitle ?? t(i18n.hero.subtitle, lang)}
          </motion.p>

          {/* CTA buttons */}
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

          {/* Stats row */}
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
        </div>

        {/* ── RIGHT: Interactive video / image preview ──────────── */}
        {hasMedia && (
          <motion.div
            className="relative hidden lg:flex items-center justify-center"
            style={{
              x: effectsEnabled ? springX : 0,
              y: effectsEnabled ? springY : 0,
            }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Amber glow halo */}
            <div
              className="absolute inset-[-16px] rounded-[48px] pointer-events-none"
              style={{
                boxShadow: "0 0 100px 30px rgba(196,145,10,0.08)",
              }}
            />

            {/* Clipped media container */}
            <motion.div
              className="relative overflow-hidden w-full cursor-pointer"
              style={{ aspectRatio: "10/13", maxHeight: "70vh" }}
              animate={{
                clipPath: expanded
                  ? "inset(-2% -2% -2% -2% round 4px)"
                  : hovered && effectsEnabled
                  ? "inset(1% 1.5% 1% 1.5% round 20px)"
                  : "inset(4% 5% 4% 5% round 32px)",
                scale: expanded ? 1.05 : hovered && effectsEnabled ? 1.02 : 1,
              }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              onHoverStart={() => effectsEnabled && setHovered(true)}
              onHoverEnd={() => effectsEnabled && setHovered(false)}
              onClick={() => setExpanded((v) => !v)}
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

              {/* Cinematic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 pointer-events-none" />

              {/* Hover / expand indicator */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  hovered || expanded ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  {expanded ? (
                    <X className="w-5 h-5 text-white" />
                  ) : videoUrl ? (
                    <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                  ) : null}
                </div>
              </div>

              {/* Corner frame decorations */}
              <div className="absolute top-4 left-4 w-5 h-5 border-t-[1.5px] border-l-[1.5px] border-white/20 pointer-events-none" />
              <div className="absolute top-4 right-4 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-white/20 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-5 h-5 border-b-[1.5px] border-l-[1.5px] border-white/20 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-5 h-5 border-b-[1.5px] border-r-[1.5px] border-white/20 pointer-events-none" />
            </motion.div>

            {/* Floating hint label */}
            <AnimatePresence>
              {hovered && effectsEnabled && !expanded && videoUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.2em] uppercase text-white/25 whitespace-nowrap pointer-events-none"
                >
                  {expandHint}
                </motion.div>
              )}
            </AnimatePresence>
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
        <span className="text-[10px] tracking-[0.2em] uppercase font-medium">
          {t(i18n.hero.scroll, lang)}
        </span>
        <ArrowDown className="w-4 h-4" />
      </motion.button>
    </section>
  );
}
