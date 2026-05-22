import { useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage, type Lang } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { useListServices } from "@workspace/api-client-react";
import type { Service } from "@workspace/api-client-react";

// ── Lottie player ──────────────────────────────────────────────────────────────

function LottiePlayer({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    let anim: { destroy: () => void } | null = null;
    import("lottie-web").then((mod) => {
      if (!ref.current) return;
      anim = mod.default.loadAnimation({
        container: ref.current,
        path: src,
        renderer: "svg",
        loop: true,
        autoplay: true,
      });
    });
    return () => { anim?.destroy(); };
  }, [src]);
  return <div ref={ref} className={className} />;
}

// ── Media renderer ─────────────────────────────────────────────────────────────

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
  return (
    <img
      src={mediaUrl}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

// ── Localisation helpers ───────────────────────────────────────────────────────

function getTitle(s: Service, lang: Lang): string {
  if (lang === "ru" && s.titleRu) return s.titleRu;
  if (lang === "tj" && s.titleTj) return s.titleTj;
  return s.title;
}

function getSubtitle(s: Service, lang: Lang): string {
  if (lang === "ru" && s.subtitleRu) return s.subtitleRu;
  if (lang === "tj" && s.subtitleTj) return s.subtitleTj;
  return s.subtitle ?? "";
}

function getDescription(s: Service, lang: Lang): string {
  if (lang === "ru" && s.descriptionRu) return s.descriptionRu;
  if (lang === "tj" && s.descriptionTj) return s.descriptionTj;
  return s.description ?? "";
}

function getLinkLabel(s: Service, lang: Lang): string {
  if (lang === "ru" && s.linkLabelRu) return s.linkLabelRu;
  if (lang === "tj" && s.linkLabelTj) return s.linkLabelTj;
  return s.linkLabel ?? (lang === "ru" ? "Подробнее" : lang === "tj" ? "Бештар" : "Learn more");
}

// ── Animation variants ─────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

// ── Single service card ────────────────────────────────────────────────────────

export function ServiceCard({ service, index, lang }: { service: Service; index: number; lang: Lang }) {
  const num = String(index + 1).padStart(2, "0");
  const title = getTitle(service, lang);
  const subtitle = getSubtitle(service, lang);
  const description = getDescription(service, lang);
  const hasLink = Boolean(service.linkUrl);

  return (
    <motion.article
      variants={cardVariant}
      className="group relative bg-white rounded-xl border border-[#e8e8e8] overflow-hidden
                 hover:border-primary/25 hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.11)]
                 transition-all duration-500"
    >
      <div className="flex flex-col lg:flex-row lg:items-stretch">

        {/* ── Content column ── */}
        <div className="flex-1 flex flex-col justify-between gap-3 p-4 md:p-5 lg:p-6 lg:py-5">
          {/* Number + optional subtitle badge */}
          <div className="flex items-start justify-between">
            <span
              className="font-display font-black text-[40px] lg:text-[52px] leading-none
                         text-[#f0ede8] select-none transition-colors duration-500
                         group-hover:text-primary/15"
            >
              {num}
            </span>
            {subtitle && (
              <span
                className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary
                           bg-[#fdf5e4] px-2 py-0.5 rounded-full mt-1"
              >
                {subtitle}
              </span>
            )}
          </div>

          {/* Title + description */}
          <div className="flex-1 flex flex-col gap-2">
            <h3
              className="font-display font-bold text-[#141414]
                         text-lg md:text-xl lg:text-[1.35rem] leading-tight"
            >
              {title}
            </h3>
            {description && (
              <p className="text-[#777] font-light max-w-sm text-[17px] leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* CTA */}
          {hasLink && (
            <a
              href={service.linkUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 self-start
                         text-xs font-semibold text-[#141414]
                         border border-[#e0e0e0] rounded-full px-3.5 py-1.5
                         hover:bg-primary hover:border-primary hover:text-white
                         transition-all duration-300 group/btn"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{getLinkLabel(service, lang)}</span>
              <ArrowUpRight
                className="w-3 h-3 transition-transform duration-300
                           group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </a>
          )}
        </div>

        {/* ── Media column ── */}
        <div
          className="relative overflow-hidden bg-[#0e0e0e]
                     aspect-video
                     lg:aspect-auto lg:w-[40%] lg:shrink-0"
        >
          <ServiceMedia
            mediaUrl={service.mediaUrl}
            mediaType={service.mediaType}
            alt={title}
            className="w-full h-full object-cover
                       transition-transform duration-700 ease-out
                       group-hover:scale-[1.04] opacity-90"
          />
          <div className="absolute inset-0 pointer-events-none
                          bg-gradient-to-r from-white/8 via-transparent to-transparent
                          lg:bg-gradient-to-r lg:from-white/6 lg:via-transparent lg:to-transparent" />
        </div>
      </div>
    </motion.article>
  );
}

// ── Skeleton loader ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#e8e8e8] overflow-hidden animate-pulse">
      <div className="flex flex-col lg:flex-row lg:min-h-[180px]">
        <div className="flex-1 p-5 space-y-3">
          <div className="h-10 w-12 bg-[#f0ede8] rounded-lg" />
          <div className="h-5 bg-[#eee] rounded w-2/3" />
          <div className="h-3 bg-[#eee] rounded w-full" />
          <div className="h-3 bg-[#eee] rounded w-4/5" />
          <div className="h-7 bg-[#eee] rounded-full w-24 mt-1" />
        </div>
        <div className="aspect-video lg:aspect-auto lg:w-[40%] bg-[#e8e8e8]" />
      </div>
    </div>
  );
}

// ── Public section (homepage — shows featured/first 3 only) ───────────────────

export function Services() {
  const { lang } = useLanguage();
  const { data: dbServices, isLoading } = useListServices();

  // Featured services for homepage: show isFeatured ones first (up to 3),
  // fall back to first 3 active by sortOrder if none are marked featured.
  const homepageServices = useMemo(() => {
    const active = [...(dbServices ?? [])]
      .filter((s) => s.isActive !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const featured = active.filter((s) => s.isFeatured);
    return featured.length > 0 ? featured.slice(0, 3) : active.slice(0, 3);
  }, [dbServices]);

  const totalActive = useMemo(
    () => (dbServices ?? []).filter((s) => s.isActive !== false).length,
    [dbServices]
  );

  return (
    <section id="services" className="py-16 md:py-24 bg-[#f8f7f5]">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 bg-[2E6876]">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12"
        >
          <div>
            <p className="section-label">{t(i18n.services.label, lang)}</p>
            <h2 className="section-heading text-[#141414]">
              {t(i18n.services.heading, lang)}
            </h2>
          </div>
          <p className="text-[#999] text-sm max-w-xs leading-relaxed font-light md:text-right">
            {lang === "ru"
              ? "Полный цикл — от идеи до финального экрана"
              : lang === "tj"
              ? "Давраи пурра — аз идея то экрани ниҳоӣ"
              : "Full cycle — from concept to final screen"}
          </p>
        </motion.div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && homepageServices.length === 0 && (
          <div className="text-center py-20 text-[#bbb] text-sm">
            {lang === "ru"
              ? "Услуги появятся в ближайшее время."
              : lang === "tj"
              ? "Хидматҳо ба зудӣ илова мешаванд."
              : "Services coming soon."}
          </div>
        )}

        {/* Cards */}
        {!isLoading && homepageServices.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="space-y-3"
          >
            {homepageServices.map((service, idx) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={idx}
                lang={lang}
              />
            ))}
          </motion.div>
        )}

        {/* View All button — shown when there are more than what's displayed */}
        {!isLoading && totalActive > homepageServices.length && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mt-12"
          >
            <Link href="/services">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full
                           border-2 border-[#141414] text-[#141414] font-semibold text-sm
                           hover:bg-[#141414] hover:text-white
                           transition-all duration-300 cursor-pointer group"
              >
                {t(i18n.servicesPage.viewAll, lang)}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.span>
            </Link>
          </motion.div>
        )}

        {/* View All button — always shown if any services exist (and all are shown, but page exists) */}
        {!isLoading && homepageServices.length > 0 && totalActive <= homepageServices.length && totalActive > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mt-12"
          >
            <Link href="/services">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full
                           border border-[#ddd] text-[#555] font-medium text-sm
                           hover:border-primary hover:text-primary
                           transition-all duration-300 cursor-pointer group"
              >
                {t(i18n.servicesPage.viewAll, lang)}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.span>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
