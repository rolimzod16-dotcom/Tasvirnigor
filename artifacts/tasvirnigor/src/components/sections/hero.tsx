import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";

const HERO_BG = "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=80";

export function Hero() {
  const { lang } = useLanguage();

  const handleScroll = () => {
    document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BG}
          alt="Film production"
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
        <div className="absolute inset-0 bg-background/30" />
      </div>

      <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="max-w-5xl"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.3em" }}
            animate={{ opacity: 1, letterSpacing: "0.25em" }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-primary font-medium tracking-[0.25em] uppercase text-xs md:text-sm mb-8"
          >
            {t(i18n.hero.tagline, lang)}
          </motion.p>
          <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-display font-bold tracking-tighter leading-none mb-8 text-foreground drop-shadow-2xl">
            TASVIRNIGOR
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-24 h-px bg-primary mx-auto mb-8"
          />
          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto mb-12 leading-relaxed">
            {t(i18n.hero.subtitle, lang)}
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 h-14 text-base font-medium tracking-wide"
            onClick={handleScroll}
            data-testid="button-explore"
          >
            {t(i18n.hero.cta, lang)}
          </Button>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 cursor-pointer text-muted-foreground hover:text-primary transition-colors flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        onClick={handleScroll}
      >
        <span className="text-xs tracking-widest uppercase opacity-50">{t(i18n.hero.scroll, lang)}</span>
        <ChevronDown className="w-5 h-5 opacity-40" />
      </motion.div>
    </section>
  );
}
