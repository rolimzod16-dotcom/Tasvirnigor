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
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
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
                 hover:border-primary/25 hover:shadow-[0_12px_36px_-10px_rgba(0,0,0,0.10)]
                 transition-all duration-500"
    >
      <div className="flex flex-col lg:flex-row lg:items-stretch">

        {/* ── Content column ── */}
        <div className="flex-1 flex flex-col justify-between gap-2 p-3.5 md:p-4 lg:p-4 lg:py-3.5">
          {/* Number + optional subtitle badge */}
          <div className="flex items-start justify-between">
            <span
              className="font-display font-black text-[30px] lg:text-[38px] leading-none
                         text-[#f0ede8] select-none transition-colors duration-500
                         group-hover:text-primary/15"
            >
              {num}
            </span>
            {subtitle && (
              <span
                className="text-[8px] font-bold uppercase tracking-[0.14em] text-primary
                           bg-[#fdf5e4] px-2 py-0.5 rounded-full mt-1"
              >
                {subtitle}
              </span>
            )}
          </div>

          {/* Title + description */}
          <div className="flex-1 flex flex-col gap-1.5 text-[16px]">
            <h3
              className="font-display font-bold text-[#141414] md:text-lg lg:text-[1.1rem] text-[36px]"
            >
              {title}
            </h3>
            {description && (
              <p className="text-[#777] font-light max-w-sm line-clamp-2 lg:line-clamp-3 text-[20px]">
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
                         text-[11px] font-semibold text-[#141414]
                         border border-[#e0e0e0] rounded-full px-3 py-1
                         hover:bg-primary hover:border-primary hover:text-white
                         transition-all duration-300 group/btn"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{getLinkLabel(service, lang)}</span>
              <ArrowUpRight
                className="w-2.5 h-2.5 transition-transform duration-300
                           group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </a>
          )}
        </div>

        {/* ── Media column ── */}
        <div
          className="relative overflow-hidden bg-[#0e0e0e]
                     aspect-[16/6]
                     lg:aspect-auto lg:w-[38%] lg:shrink-0"
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
      <div className="flex flex-col lg:flex-row lg:min-h-[120px]">
        <div className="flex-1 p-4 space-y-2">
          <div className="h-8 w-10 bg-[#f0ede8] rounded-lg" />
          <div className="h-4 bg-[#eee] rounded w-2/3" />
          <div className="h-3 bg-[#eee] rounded w-full" />
          <div className="h-6 bg-[#eee] rounded-full w-20 mt-1" />
        </div>
        <div className="aspect-[16/6] lg:aspect-auto lg:w-[38%] bg-[#e8e8e8]" />
      </div>
    </div>
  );
}

// ── Public section (homepage — shows featured/first 6 only) ───────────────────

export function Services() {
  const { lang } = useLanguage();
  const { data: dbServices, isLoading } = useListServices();

  const homepageServices = useMemo(() => {
    const active = [...(dbServices ?? [])]
      .filter((s) => s.isActive !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const featured = active.filter((s) => s.isFeatured);
    return featured.length > 0 ? featured.slice(0, 6) : active.slice(0, 6);
  }, [dbServices]);

  return (
    <section id="services" className="py-10 md:py-14 bg-[#2e6876]">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 bg-[#2e6876]">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7"
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
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && homepageServices.length === 0 && (
          <div className="text-center py-16 text-[#bbb] text-sm">
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
            className="space-y-2"
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

        {/* Other Services CTA */}
        {!isLoading && homepageServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex justify-center mt-8"
          >
            <Link href="/services">
              <motion.span
                whileHover="hover"
                initial="rest"
                className="inline-flex items-center gap-2.5 px-7 py-2.5 rounded-full border border-primary/50 text-primary/90 font-medium text-[13px] hover:border-primary hover:text-primary hover:shadow-[0_0_24px_-4px_rgba(196,145,10,0.35)] transition-all duration-300 cursor-pointer tracking-wide bg-[#000000]"
              >
                {lang === "ru" ? "Другие услуги" : lang === "tj" ? "Хидматҳои дигар" : "Other Services"}
                <motion.span
                  variants={{ rest: { x: 0 }, hover: { x: 3 } }}
                  transition={{ duration: 0.25 }}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.span>
              </motion.span>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
