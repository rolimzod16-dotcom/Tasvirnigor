import { useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { useGetHero } from "@workspace/api-client-react";

const HERO_BG = "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=80";

// Cinematic spring — fluid, weighted feel
const SPRING = { type: "spring" as const, damping: 26, stiffness: 160, mass: 1.1 };
// Parallax spring — lags slightly behind cursor for depth feel
const PARALLAX = { stiffness: 42, damping: 18 };

export function Hero() {
  const { lang } = useLanguage();
  const { data: heroContent } = useGetHero();

  // Three-level hover state
  // "near"   → cursor in the right column (proximity zone)
  // "over"   → cursor directly over the video frame
  const [hoverLevel, setHoverLevel] = useState<"idle" | "near" | "over">("idle");

  const effectsEnabled = heroContent?.effectsEnabled !== false;
  const videoUrl = heroContent?.videoUrl ?? null;
  const fallbackImageUrl = heroContent?.fallbackImageUrl ?? null;
  const hasMedia = !!(videoUrl || fallbackImageUrl);

  // Section-wide ambient parallax (drives the whole video column)
  const sectionX = useMotionValue(0);
  const sectionY = useMotionValue(0);
  const columnX = useSpring(sectionX, PARALLAX);
  const columnY = useSpring(sectionY, PARALLAX);

  // Video-area precise parallax (drives the inner frame — stronger, more responsive)
  const videoX = useMotionValue(0);
  const videoY = useMotionValue(0);
  const frameX = useSpring(videoX, { stiffness: 68, damping: 20 });
  const frameY = useSpring(videoY, { stiffness: 68, damping: 20 });

  // Section-level mouse tracking — ambient parallax + near-video detection
  const handleSectionMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!effectsEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rx = (e.clientX - rect.left - rect.width / 2) * 0.018;
    const ry = (e.clientY - rect.top - rect.height / 2) * 0.018;
    sectionX.set(rx);
    sectionY.set(ry);
  };

  const handleSectionLeave = () => {
    sectionX.set(0);
    sectionY.set(0);
    videoX.set(0);
    videoY.set(0);
    setHoverLevel("idle");
  };

  // Right-column tracking — proximity hover stage
  const handleColumnMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!effectsEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    videoX.set((e.clientX - rect.left - rect.width / 2) * 0.055);
    videoY.set((e.clientY - rect.top - rect.height / 2) * 0.055);
    if (hoverLevel === "idle") setHoverLevel("near");
  };

  const handleColumnLeave = () => {
    videoX.set(0);
    videoY.set(0);
    setHoverLevel("idle");
  };

  // Video frame tracking — direct hover stage
  const handleFrameEnter = () => {
    if (effectsEnabled) setHoverLevel("over");
  };
  const handleFrameLeave = () => {
    setHoverLevel("near");
  };

  // Localized text
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

  const ctaPrimaryHref = heroContent?.ctaPrimaryHref ?? "#portfolio";
  const ctaSecondaryHref = heroContent?.ctaSecondaryHref ?? "#about";

  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  const handleCta = (href: string) => href.startsWith("#") ? scrollTo(href) : (window.location.href = href);

  const styledHeadline =
    lang === "ru" ? <>Кино и <span className="text-primary">анимация</span> из Таджикистана</> :
    lang === "tj" ? <>Кино ва <span className="text-primary">анимация</span> аз Тоҷикистон</> :
    <>Film & <span className="text-primary">Animation</span> from Tajikistan</>;

  const stats = [
    { num: "10+", label: lang === "ru" ? "Лет" : lang === "tj" ? "Сол" : "Years" },
    { num: "40+", label: lang === "ru" ? "Проектов" : lang === "tj" ? "Лоиҳа" : "Projects" },
    { num: "20+", label: lang === "ru" ? "Стран" : lang === "tj" ? "Кишвар" : "Countries" },
  ];

  // Animation values per hover level
  const isNear = hoverLevel === "near" || hoverLevel === "over";
  const isOver = hoverLevel === "over";

  const clipPath =
    isOver  ? "inset(-3% -3% -3% -3% round 6px)"   // bleeds outside, near-sharp corners
    : isNear ? "inset(1%  1%  1%  1%  round 16px)"  // slight reveal, softened
    :           "inset(6%  7%  6%  7%  round 36px)"; // default: portrait aperture

  const frameScale  = isOver ? 1.10 : isNear ? 1.045 : 1;
  const glowOpacity = isOver ? 0.22  : isNear ? 0.12  : 0.06;
  const glowScale   = isOver ? 1.25  : isNear ? 1.08  : 1;
  const dimOpacity  = isOver ? 0.30  : isNear ? 0.14  : 0;

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex items-center overflow-hidden bg-[#080808]"
      onMouseMove={handleSectionMove}
      onMouseLeave={handleSectionLeave}
    >
      {/* Ambient radial glow — grows on hover */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-[55%] -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(38 82% 42%) 0%, transparent 65%)" }}
          animate={{ opacity: glowOpacity, scale: glowScale }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>

      {/* Section dim — subtle veil that focuses on video when cursor is near */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none z-[5]"
        animate={{ opacity: dimOpacity }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Static BG (no custom media uploaded yet) */}
      {!hasMedia && (
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_BG} alt=""
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

        {/* ── LEFT: Text ─────────────────────────────────────────── */}
        <div className="flex flex-col justify-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-primary font-semibold tracking-[0.22em] uppercase text-xs mb-6"
          >
            {t(i18n.hero.tagline, lang)}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="font-display font-extrabold text-white leading-[0.93] tracking-tight mb-7"
            style={{ fontSize: "clamp(2.7rem, 6.5vw, 5.6rem)" }}
          >
            {title ?? styledHeadline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-white/55 font-light text-base md:text-lg max-w-xl leading-relaxed mb-10"
          >
            {subtitle ?? t(i18n.hero.subtitle, lang)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
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

          {/* Mobile: simple embedded video (no fullscreen, no controls) */}
          {hasMedia && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="lg:hidden mt-8 relative rounded-2xl overflow-hidden"
              style={{ aspectRatio: "16/9" }}
            >
              {videoUrl ? (
                <video src={videoUrl} autoPlay muted loop playsInline
                  className="w-full h-full object-cover"
                  poster={fallbackImageUrl ?? undefined}
                />
              ) : (
                <img src={fallbackImageUrl!} alt="Tasvirnigor Studio"
                  className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          )}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
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

        {/* ── RIGHT: Cinematic video frame (desktop only) ──────────── */}
        {hasMedia && (
          /* Proximity zone — entering this column triggers Stage 1 expansion */
          <motion.div
            className="relative hidden lg:flex items-center justify-center"
            style={{ x: effectsEnabled ? columnX : 0, y: effectsEnabled ? columnY : 0 }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onMouseMove={handleColumnMove}
            onMouseLeave={handleColumnLeave}
          >
            {/* Animated amber glow ring */}
            <motion.div
              className="absolute inset-[-24px] rounded-[52px] pointer-events-none"
              animate={{
                boxShadow: isOver
                  ? "0 0 160px 60px rgba(196,145,10,0.20), 0 50px 120px rgba(0,0,0,0.75)"
                  : isNear
                  ? "0 0 110px 35px rgba(196,145,10,0.11), 0 30px 80px rgba(0,0,0,0.55)"
                  : "0 0 80px 20px rgba(196,145,10,0.05), 0 16px 50px rgba(0,0,0,0.35)",
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />

            {/* Video frame — the core cinematic element */}
            <motion.div
              className="relative overflow-visible w-full"
              style={{
                aspectRatio: "10/13",
                maxHeight: "70vh",
                x: effectsEnabled ? frameX : 0,
                y: effectsEnabled ? frameY : 0,
                willChange: "transform, clip-path",
              }}
              animate={{ clipPath, scale: frameScale }}
              transition={SPRING}
              onMouseEnter={handleFrameEnter}
              onMouseLeave={handleFrameLeave}
            >
              {/* Media */}
              <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                {videoUrl ? (
                  <video
                    src={videoUrl}
                    autoPlay muted loop playsInline
                    className="w-full h-full object-cover"
                    poster={fallbackImageUrl ?? undefined}
                    style={{ willChange: "transform" }}
                  />
                ) : (
                  <img
                    src={fallbackImageUrl!}
                    alt="Tasvirnigor Studio"
                    className="w-full h-full object-cover"
                    style={{ willChange: "transform" }}
                  />
                )}
              </div>

              {/* Cinematic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

              {/* Corner marks — fade away as video expands */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: isOver ? 0 : isNear ? 0.4 : 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute top-4 left-4 w-5 h-5 border-t-[1.5px] border-l-[1.5px] border-white/25" />
                <div className="absolute top-4 right-4 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-white/25" />
                <div className="absolute bottom-4 left-4 w-5 h-5 border-b-[1.5px] border-l-[1.5px] border-white/25" />
                <div className="absolute bottom-4 right-4 w-5 h-5 border-b-[1.5px] border-r-[1.5px] border-white/25" />
              </motion.div>

              {/* Bottom label — fades in as cursor approaches */}
              <motion.div
                className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none"
                animate={{ opacity: isNear ? 1 : 0, y: isNear ? 0 : 6 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <span className="text-[9px] tracking-[0.28em] uppercase text-white/35 font-medium">
                  Tasvirnigor Studio
                </span>
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
        <span className="text-[10px] tracking-[0.2em] uppercase font-medium">{t(i18n.hero.scroll, lang)}</span>
        <ArrowDown className="w-4 h-4" />
      </motion.button>
    </section>
  );
}
