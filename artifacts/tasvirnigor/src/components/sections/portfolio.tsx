import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, ExternalLink, Film, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage, type Lang } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { localize } from "@/lib/localize";
import { ensureProtocol } from "@/lib/utils";
import { useListProjects, useListCategories } from "@workspace/api-client-react";
import type { Project, Category, ProjectMediaItem } from "@workspace/api-client-react";

// ── Media helpers ─────────────────────────────────────────────────────────────

function getThumbnail(project: Project): string {
  if (project.bannerUrl) return project.bannerUrl;
  const items = (project.mediaItems ?? []) as ProjectMediaItem[];
  const still = items.find((m) => m.mimeType.startsWith("image/") && m.mimeType !== "image/gif");
  return still?.url ?? items[0]?.url ?? "";
}

type AnimPreview = { url: string; isVideo: boolean };

function getAnimPreview(project: Project): AnimPreview | null {
  const items = (project.mediaItems ?? []) as ProjectMediaItem[];
  const gif = items.find((m) => m.mimeType === "image/gif");
  if (gif) return { url: gif.url, isVideo: false };
  const vid = items.find((m) => m.mimeType.startsWith("video/"));
  if (vid) return { url: vid.url, isVideo: true };
  return null;
}

function hasAnimatedMedia(project: Project): boolean {
  return getAnimPreview(project) !== null;
}

// ── Localisation helpers ──────────────────────────────────────────────────────

function getCategoryName(cat: Category, lang: Lang): string {
  if (lang === "ru" && cat.nameRu) return cat.nameRu;
  if (lang === "tj" && cat.nameTj) return cat.nameTj;
  return cat.name;
}

// ── Category chips ────────────────────────────────────────────────────────────

function CategoryChips({ categories, lang }: { categories: Category[]; lang: Lang }) {
  if (!categories.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((cat) => (
        <span
          key={cat.id}
          className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full
                     bg-white/15 text-white border border-white/25 backdrop-blur-sm"
        >
          {getCategoryName(cat, lang)}
        </span>
      ))}
    </div>
  );
}

// ── Animated media preview ────────────────────────────────────────────────────

function AnimatedPreview({ preview, className }: { preview: AnimPreview; className?: string }) {
  if (preview.isVideo) {
    return (
      <video
        src={preview.url}
        className={className}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
    );
  }
  return <img src={preview.url} alt="" className={className} />;
}

// ── Carousel card ─────────────────────────────────────────────────────────────

function CarouselCard({ project, lang, priority = false }: { project: Project; lang: Lang; priority?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const preview = getAnimPreview(project);
  const thumb = getThumbnail(project);
  const title = localize(project as unknown as Record<string, unknown>, "title", lang) as string;
  const desc = localize(project as unknown as Record<string, unknown>, "description", lang) as string | null;
  const isLink = !!project.youtubeUrl;
  const Wrapper = isLink ? motion.a : motion.div;
  const linkProps = isLink
    ? { href: ensureProtocol(project.youtubeUrl!) ?? "#", target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      {...linkProps}
      className={`group block relative rounded-2xl overflow-hidden bg-[#0c0c0c]
                  flex-shrink-0
                  w-[82vw] sm:w-[340px] md:w-[380px] lg:w-[420px]
                  border border-white/5 hover:border-primary/40
                  hover:shadow-[0_24px_64px_-16px_rgba(196,145,10,0.25)]
                  transition-all duration-400
                  ${isLink ? "cursor-pointer" : "cursor-default"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Media */}
      <div className="aspect-[3/4] relative overflow-hidden">
        {thumb && (
          <img
            src={thumb}
            alt={title}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700
                        ${hovered && preview ? "opacity-0 scale-[1.04]" : "opacity-80 group-hover:scale-[1.02]"}`}
            loading={priority ? "eager" : "lazy"}
          />
        )}
        {hovered && preview && (
          <AnimatedPreview
            preview={preview}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {hasAnimatedMedia(project) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                             bg-black/60 backdrop-blur-sm border border-white/10
                             text-[9px] font-bold text-white uppercase tracking-widest">
              <Film className="w-2.5 h-2.5 text-primary" />
              {preview?.isVideo ? "Video" : "GIF"}
            </span>
          )}
        </div>

        {/* Play button */}
        {isLink && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center
                            opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100
                            transition-all duration-300 shadow-2xl shadow-primary/50">
              <Play className="w-5 h-5 ml-0.5 text-white" fill="white" />
            </div>
          </div>
        )}

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="space-y-2">
            <CategoryChips categories={project.categories ?? []} lang={lang} />
            <h4 className="font-display font-bold text-white text-lg leading-tight
                           group-hover:text-primary transition-colors duration-200 line-clamp-2">
              {title}
            </h4>
            {desc && (
              <p className="text-white/50 text-xs line-clamp-2 leading-relaxed font-light">
                {desc}
              </p>
            )}
          </div>
        </div>

        {isLink && (
          <ExternalLink className="absolute top-3 right-3 w-4 h-4 text-white/40
                                   opacity-0 group-hover:opacity-100 group-hover:text-primary
                                   transition-all duration-200" />
        )}
      </div>
    </Wrapper>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function SkeletonCarousel() {
  return (
    <div className="flex gap-5 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex-shrink-0 w-[82vw] sm:w-[340px] md:w-[380px] lg:w-[420px]
                     rounded-2xl bg-[#f0f0f0] animate-pulse"
          style={{ aspectRatio: "3/4" }}
        />
      ))}
    </div>
  );
}

// ── Infinite-loop draggable carousel ──────────────────────────────────────────
// Renders three copies of the item list. We always keep the user scrolled into
// the middle copy and silently jump ±1 copy-width when they drift to either edge.

function InfiniteCarousel({ projects, lang }: { projects: Project[]; lang: Lang }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const jumpScheduled = useRef(false);

  // Triple the list so both left and right have a full copy to scroll into
  const copies = useMemo(
    () => [0, 1, 2].flatMap((ci) => projects.map((p) => ({ ...p, _key: `${ci}-${p.id}` }))),
    [projects],
  );

  // On mount / when projects change: park the scroll at the start of copy #2
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const park = () => {
      el.scrollLeft = el.scrollWidth / 3;
    };
    // rAF ensures layout is painted before we read scrollWidth
    const raf = requestAnimationFrame(park);
    return () => cancelAnimationFrame(raf);
  }, [projects.length]);

  // After each scroll event ends (50 ms debounce), recentre if needed.
  // We only act when the user is clearly into copy #1 or copy #3 to avoid
  // fighting with smooth-scroll arrow clicks that stay within copy #2.
  const scheduleJump = useCallback(() => {
    if (jumpScheduled.current) return;
    jumpScheduled.current = true;
    setTimeout(() => {
      jumpScheduled.current = false;
      const el = trackRef.current;
      if (!el) return;
      const third = el.scrollWidth / 3;
      if (el.scrollLeft < third * 0.75) {
        el.scrollLeft += third;
      } else if (el.scrollLeft > third * 2.25 - el.clientWidth) {
        el.scrollLeft -= third;
      }
    }, 50);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", scheduleJump, { passive: true });
    return () => el.removeEventListener("scroll", scheduleJump);
  }, [scheduleJump]);

  const scrollByCard = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(":scope > div")?.getBoundingClientRect().width ?? 400;
    el.scrollBy({ left: dir === "right" ? cardWidth + 20 : -(cardWidth + 20), behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.clientX;
    startScrollLeft.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !trackRef.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 5) {
      hasDragged.current = true;
      trackRef.current.scrollLeft = startScrollLeft.current - dx;
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    isDragging.current = false;
    el.style.cursor = "";
    el.style.userSelect = "";
    el.releasePointerCapture(e.pointerId);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.stopPropagation();
      e.preventDefault();
      hasDragged.current = false;
    }
  };

  return (
    <div className="relative group/carousel">
      {/* Scroll track */}
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto pb-3
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                   cursor-grab"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClickCapture={onClickCapture}
      >
        {copies.map(({ _key, ...project }, idx) => (
          <div key={_key} className="flex-shrink-0">
            <CarouselCard
              project={project as Project}
              lang={lang}
              priority={idx < 3}
            />
          </div>
        ))}
      </div>

      {/* Prev arrow — always visible since the carousel is infinite */}
      <button
        onClick={() => scrollByCard("left")}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5
                   w-12 h-12 rounded-full bg-white border border-[#e8e8e8] shadow-lg
                   items-center justify-center z-10
                   hover:bg-primary hover:border-primary hover:text-white
                   text-[#141414] transition-all duration-200"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Next arrow */}
      <button
        onClick={() => scrollByCard("right")}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-5
                   w-12 h-12 rounded-full bg-white border border-[#e8e8e8] shadow-lg
                   items-center justify-center z-10
                   hover:bg-primary hover:border-primary hover:text-white
                   text-[#141414] transition-all duration-200"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-3 w-16
                      bg-gradient-to-r from-[#4F8FA8] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-16
                      bg-gradient-to-l from-[#2F5F73] to-transparent" />
    </div>
  );
}

// ── Public section ────────────────────────────────────────────────────────────

export function Portfolio() {
  const { lang } = useLanguage();
  const { data: allProjects, isLoading: loadingProjects } = useListProjects();
  const { data: allCategories = [] } = useListCategories();

  const activeProjects = useMemo(() => {
    const all = [...(allProjects ?? [])]
      .filter((p) => p.isActive !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const featured = all.filter((p) => p.isFeatured);
    return featured.length > 0 ? featured : all.slice(0, 8);
  }, [allProjects]);

  // Only use categories that appear in active projects
  const usedCategories = useMemo(() => {
    const used = new Set<number>();
    activeProjects.forEach((p) => (p.categories ?? []).forEach((c) => used.add(c.id)));
    return allCategories
      .filter((c) => used.has(c.id))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  }, [allCategories, activeProjects]);

  if (loadingProjects) {
    return (
      <section id="portfolio" className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="h-8 w-48 bg-[#f0f0f0] rounded animate-pulse mb-3" />
          <div className="h-14 w-72 bg-[#f0f0f0] rounded animate-pulse mb-10" />
          <SkeletonCarousel />
        </div>
      </section>
    );
  }

  if (!activeProjects.length) return null;

  return (
    <section id="portfolio" className="py-24 md:py-32 overflow-hidden bg-gradient-to-r from-[#4F8FA8] via-[#3F7388] to-[#2F5F73]">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8"
        >
          <div>
            <p className="section-label text-[19px] text-[#ffffff] bg-[#c38313]">{t(i18n.portfolio.label, lang)}</p>
            <h2 className="section-heading text-white">
              {t(i18n.portfolio.heading, lang)}
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <p className="text-white/50 text-xs font-light">
              {t(i18n.portfolio.dragHint, lang)}
            </p>
            {usedCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 md:justify-end">
                {usedCategories.slice(0, 5).map((cat) => (
                  <span key={cat.id}
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full
                               bg-white/12 text-white/70 border border-white/20 backdrop-blur-sm">
                    {getCategoryName(cat, lang)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Infinite carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="-mx-5 px-5 lg:-mx-10 lg:px-10"
        >
          <InfiniteCarousel projects={activeProjects} lang={lang} />
        </motion.div>

        {/* View Full Portfolio CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mt-12"
        >
          <Link href="/portfolio">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full backdrop-blur-sm border border-white/30 text-white font-semibold text-sm hover:bg-white/20 hover:border-[#FAB037]/50 hover:shadow-[0_0_28px_-4px_rgba(250,176,55,0.28)] transition-all duration-[350ms] ease-out cursor-pointer group bg-[#000000]"
            >
              {t(i18n.portfolio.viewAll, lang)}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
