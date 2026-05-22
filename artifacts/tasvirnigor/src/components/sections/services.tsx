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
                 hover:bg-[#FAB037] hover:border-[#FAB037]
                 hover:shadow-[0_12px_35px_rgba(250,176,55,0.22)]
                 transition-all duration-[350ms] ease"
    >
      <div className="flex flex-col lg:flex-row lg:items-stretch">

        {/* ── Content column ── */}
        <div className="flex-1 flex flex-col justify-between gap-2 p-3.5 md:p-4 lg:p-4 lg:py-3.5 bg-[#fab03700]">
          {/* Number + optional subtitle badge */}
          <div className="flex items-start justify-between">
            <span
              className="font-display font-black text-[30px] lg:text-[38px] leading-none select-none
                         text-[#f0ede8] group-hover:text-[#111]/20
                         transition-colors duration-[350ms]"
            >
              {num}
            </span>
            {subtitle && (
              <span
                className="text-[8px] font-bold uppercase tracking-[0.14em] mt-1 rounded-full px-2 py-0.5
                           text-primary bg-[#fdf5e4]
                           group-hover:text-[#111] group-hover:bg-[#111]/12
                           transition-colors duration-[350ms]"
              >
                {subtitle}
              </span>
            )}
          </div>

          {/* Title + description */}
          <div className="flex-1 flex flex-col gap-1.5 text-[16px] bg-[#fab03700]">
            <h3
              className="font-display font-bold md:text-lg lg:text-[1.1rem] text-[36px] leading-tight group-hover:text-[#111111] transition-colors duration-[350ms] text-[#000000]"
            >
              {title}
            </h3>
            {description && (
              <p className="font-light max-w-sm line-clamp-2 lg:line-clamp-3 text-[20px] group-hover:text-[#111111]/75 transition-colors duration-[350ms] text-[#000000]">
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
                         text-[11px] font-semibold rounded-full px-3 py-1
                         text-[#141414] border border-[#e0e0e0]
                         group-hover:text-[#111111] group-hover:border-[#111]/35
                         hover:bg-[#111]/10 hover:border-[#111]/50
                         transition-all duration-[350ms] group/btn"
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
            className="w-full h-full object-cover opacity-90
                       transition-transform duration-[350ms] ease
                       group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 pointer-events-none transition-all duration-[400ms]
                          bg-gradient-to-r from-white/8 via-transparent to-transparent
                          group-hover:from-[#FAB037]/15
                          lg:from-white/6" />
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
    <section id="services" className="py-10 md:py-14 bg-gradient-to-r from-[#4F8FA8] via-[#3F7388] to-[#2F5F73]">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">

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
            <h2 className="section-heading text-white">
              {t(i18n.services.heading, lang)}
            </h2>
          </div>
          <p className="text-white/60 text-sm max-w-xs leading-relaxed font-light md:text-right">
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
                className="inline-flex items-center gap-2.5 px-7 py-2.5 rounded-full border border-white/30 font-medium text-[13px] hover:border-[#FAB037]/55 hover:text-white hover:bg-white/15 hover:shadow-[0_0_28px_-4px_rgba(250,176,55,0.30)] transition-all duration-[350ms] ease-out cursor-pointer tracking-wide backdrop-blur-sm border-t-[#000000] border-r-[#000000] border-b-[#000000] border-l-[#000000] bg-[#000000] text-[#ffffff]"
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
