import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Film, Palette, MonitorPlay, MonitorSmartphone, Video, Clapperboard, Layers, Sparkles } from "lucide-react";
import { useLanguage, type Lang } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { useListServices } from "@workspace/api-client-react";
import type { Service } from "@workspace/api-client-react";

// Fallback icons cycling per service index
const ICON_CYCLE = [Film, Palette, MonitorPlay, MonitorSmartphone, Video, Clapperboard, Layers, Sparkles];

// ── Media renderer ─────────────────────────────────────────────────────────────

function LottiePlayer({ src, className }: { src: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    let anim: { destroy: () => void } | null = null;
    import("lottie-web").then((mod) => {
      const Lottie = mod.default;
      if (!containerRef.current) return;
      anim = Lottie.loadAnimation({
        container: containerRef.current,
        path: src,
        renderer: "svg",
        loop: true,
        autoplay: true,
      });
    });
    return () => { anim?.destroy(); };
  }, [src]);
  return <div ref={containerRef} className={className} />;
}

function ServiceMedia({
  mediaUrl,
  mediaType,
  alt,
  className,
}: {
  mediaUrl: string;
  mediaType: string;
  alt: string;
  className?: string;
}) {
  if (mediaType === "video") {
    return (
      <video
        src={mediaUrl}
        autoPlay
        loop
        muted
        playsInline
        className={className}
      />
    );
  }
  if (mediaType === "lottie") {
    return <LottiePlayer src={mediaUrl} className={className} />;
  }
  // image or gif — both render as <img>; GIFs animate natively
  return (
    <img
      src={mediaUrl}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}

// ── Animation variants ─────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function getTitle(s: Service, lang: Lang) {
  if (lang === "ru" && s.titleRu) return s.titleRu;
  if (lang === "tj" && s.titleTj) return s.titleTj;
  return s.title;
}

function getDescription(s: Service, lang: Lang) {
  if (lang === "ru" && s.descriptionRu) return s.descriptionRu;
  if (lang === "tj" && s.descriptionTj) return s.descriptionTj;
  return s.description ?? "";
}

function getLinkLabel(s: Service, lang: Lang) {
  if (lang === "ru" && s.linkLabelRu) return s.linkLabelRu;
  if (lang === "tj" && s.linkLabelTj) return s.linkLabelTj;
  return s.linkLabel ?? (lang === "ru" ? "Узнать больше" : lang === "tj" ? "Бештар донед" : "Learn more");
}

// ── Card components ────────────────────────────────────────────────────────────

function FeaturedCard({ service, Icon, lang, num }: { service: Service; Icon: React.ElementType; lang: Lang; num: string }) {
  return (
    <motion.div
      variants={cardVariant}
      className="group lg:col-span-2 bg-white rounded-2xl overflow-hidden border border-[#e8e8e8] hover:border-primary/20 hover:shadow-[0_16px_56px_-12px_rgba(0,0,0,0.13)] transition-all duration-400 cursor-default"
    >
      <div className="relative overflow-hidden aspect-[16/9] lg:aspect-[2.4/1] bg-[#111]">
        <ServiceMedia
          mediaUrl={service.mediaUrl}
          mediaType={service.mediaType}
          alt={getTitle(service, lang)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04] opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-400" />
        <span className="absolute top-5 right-5 text-white/50 font-display font-bold text-3xl select-none leading-none group-hover:text-primary transition-colors duration-300">
          {num}
        </span>
      </div>
      <div className="p-6 md:p-7 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#fdf5e4] text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Icon className="w-4 h-4" />
            </span>
            <h3 className="font-display font-bold text-[#141414] text-lg">
              {getTitle(service, lang)}
            </h3>
          </div>
          <p className="text-[#666] text-sm font-light leading-relaxed max-w-lg">
            {getDescription(service, lang)}
          </p>
        </div>
        <ArrowUpRight className="w-5 h-5 text-[#ccc] group-hover:text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-1" />
      </div>
    </motion.div>
  );
}

function StandardCard({ service, Icon, lang, num, aspectClass }: { service: Service; Icon: React.ElementType; lang: Lang; num: string; aspectClass: string }) {
  return (
    <motion.div
      variants={cardVariant}
      className="group bg-white rounded-2xl overflow-hidden border border-[#e8e8e8] hover:border-primary/20 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] transition-all duration-400 cursor-default"
    >
      <div className={`relative overflow-hidden ${aspectClass} bg-[#111]`}>
        <ServiceMedia
          mediaUrl={service.mediaUrl}
          mediaType={service.mediaType}
          alt={getTitle(service, lang)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05] opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-400" />
        <span className="absolute top-4 right-4 text-white/45 font-display font-bold text-2xl select-none leading-none group-hover:text-primary transition-colors duration-300">
          {num}
        </span>
      </div>
      <div className="p-5 md:p-6 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#fdf5e4] text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </span>
            <h3 className="font-display font-bold text-[#141414] text-base leading-tight">
              {getTitle(service, lang)}
            </h3>
          </div>
          <p className="text-[#777] text-sm font-light leading-relaxed line-clamp-3">
            {getDescription(service, lang)}
          </p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[#ddd] group-hover:text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-0.5" />
      </div>
    </motion.div>
  );
}

function FullWidthCard({ service, Icon, lang, num }: { service: Service; Icon: React.ElementType; lang: Lang; num: string }) {
  return (
    <motion.div
      variants={cardVariant}
      className="group lg:col-span-3 bg-white rounded-2xl overflow-hidden border border-[#e8e8e8] hover:border-primary/20 hover:shadow-[0_16px_56px_-12px_rgba(0,0,0,0.13)] transition-all duration-400 cursor-default"
    >
      <div className="lg:flex lg:items-stretch">
        <div className="relative overflow-hidden aspect-[16/9] lg:aspect-auto lg:w-[55%] bg-[#111] shrink-0">
          <ServiceMedia
            mediaUrl={service.mediaUrl}
            mediaType={service.mediaType}
            alt={getTitle(service, lang)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04] opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 lg:bg-gradient-to-r lg:from-transparent lg:to-black/40" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-400" />
          <span className="absolute top-5 right-5 text-white/50 font-display font-bold text-3xl select-none leading-none group-hover:text-primary transition-colors duration-300">
            {num}
          </span>
        </div>
        <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#fdf5e4] text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Icon className="w-4.5 h-4.5" />
            </span>
            <h3 className="font-display font-bold text-[#141414] text-xl">
              {getTitle(service, lang)}
            </h3>
          </div>
          <p className="text-[#666] text-sm md:text-base font-light leading-relaxed max-w-md mb-5">
            {getDescription(service, lang)}
          </p>
          {service.linkUrl ? (
            <a
              href={service.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary text-sm font-semibold hover:underline"
            >
              <span>{getLinkLabel(service, lang)}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          ) : (
            <div className="flex items-center gap-2 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>{getLinkLabel(service, lang)}</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Public section ─────────────────────────────────────────────────────────────

export function Services() {
  const { lang } = useLanguage();
  const { data: dbServices, isLoading } = useListServices();

  const sorted = [...(dbServices ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  const count = sorted.length;

  return (
    <section id="services" className="py-24 md:py-32 bg-[#f8f7f5]">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-14"
        >
          <div>
            <p className="section-label">{t(i18n.services.label, lang)}</p>
            <h2 className="section-heading text-[#141414]">
              {t(i18n.services.heading, lang)}
            </h2>
          </div>
          <p className="text-[#888] text-sm max-w-xs leading-relaxed font-light md:text-right">
            {lang === "ru"
              ? "Полный цикл производства — от идеи до финального экрана"
              : lang === "tj"
              ? "Давраи пурраи истеҳсол — аз идея то экрани ниҳоӣ"
              : "Full production cycle — from concept to final screen"}
          </p>
        </motion.div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-[#eee]" />
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-[#eee] rounded w-2/3" />
                  <div className="h-3 bg-[#eee] rounded w-full" />
                  <div className="h-3 bg-[#eee] rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && count === 0 && (
          <div className="text-center py-16 text-[#aaa] text-sm">
            {lang === "ru"
              ? "Услуги будут добавлены в ближайшее время."
              : lang === "tj"
              ? "Хидматҳо ба зудӣ илова мешаванд."
              : "Services coming soon."}
          </div>
        )}

        {!isLoading && count > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {sorted.map((service, idx) => {
              const Icon = ICON_CYCLE[idx % ICON_CYCLE.length];
              const num = String(idx + 1).padStart(2, "0");

              // First card: featured (col-span-2) when more than 1 service
              if (idx === 0 && count > 1) {
                return (
                  <FeaturedCard key={service.id} service={service} Icon={Icon} lang={lang} num={num} />
                );
              }

              // Last card: full-width (col-span-3) when more than 2 services
              if (idx === count - 1 && count > 2) {
                return (
                  <FullWidthCard key={service.id} service={service} Icon={Icon} lang={lang} num={num} />
                );
              }

              // Standard card
              return (
                <StandardCard key={service.id} service={service} Icon={Icon} lang={lang} num={num} aspectClass="aspect-[4/3]" />
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
