import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";

const HERO_BG = "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=80";

export function Hero() {
  const { lang } = useLanguage();

  const scrollToAbout = () => {
    document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToPortfolio = () => {
    document.querySelector("#portfolio")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex items-center overflow-hidden bg-[#0c0c0c]"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BG}
          alt="Film production"
          className="absolute inset-0 w-full h-full object-cover opacity-45"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0c]/95 via-[#0c0c0c]/60 to-[#0c0c0c]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c]/80 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10 w-full pt-28 pb-24">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-primary font-semibold tracking-[0.22em] uppercase text-xs mb-7"
          >
            {t(i18n.hero.tagline, lang)}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="font-display font-extrabold text-white leading-[0.95] tracking-tight mb-7"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
          >
            {lang === "ru" ? (
              <>
                Кино и{" "}
                <span className="text-primary">анимация</span>
                {" "}из Таджикистана
              </>
            ) : lang === "tj" ? (
              <>
                Кино ва{" "}
                <span className="text-primary">анимация</span>
                {" "}аз Тоҷикистон
              </>
            ) : (
              <>
                Film &{" "}
                <span className="text-primary">Animation</span>
                {" "}from Tajikistan
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-white/60 font-light text-base md:text-lg max-w-xl leading-relaxed mb-10"
          >
            {t(i18n.hero.subtitle, lang)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={scrollToPortfolio}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all duration-200 hover:gap-3.5"
            >
              {t(i18n.hero.cta, lang)}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={scrollToAbout}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/25 text-white/80 font-medium text-sm hover:border-white/50 hover:text-white transition-all duration-200"
            >
              {t(i18n.nav.about, lang)}
            </button>
          </motion.div>
        </div>
      </div>

      <motion.button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/40 hover:text-white/70 transition-colors"
        animate={{ y: [0, 7, 0] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        onClick={scrollToAbout}
      >
        <span className="text-[10px] tracking-[0.2em] uppercase font-medium">
          {t(i18n.hero.scroll, lang)}
        </span>
        <ArrowDown className="w-4 h-4" />
      </motion.button>
    </section>
  );
}
