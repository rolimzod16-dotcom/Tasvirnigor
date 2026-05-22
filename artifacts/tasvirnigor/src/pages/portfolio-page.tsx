import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, ExternalLink, Film } from "lucide-react";
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

function getCategoryName(cat: Category, lang: Lang): string {
  if (lang === "ru" && cat.nameRu) return cat.nameRu;
  if (lang === "tj" && cat.nameTj) return cat.nameTj;
  return cat.name;
}

// ── Filter pill ───────────────────────────────────────────────────────────────

function FilterPill({
  label, count, active, onClick,
}: { label: string; count: number | null; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      layout
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold
                  transition-colors duration-200 select-none
        ${active
          ? "bg-primary text-white shadow-md shadow-primary/20"
          : "bg-white text-[#555] border border-[#e0e0e0] hover:border-primary/40 hover:text-primary"
        }`}
      whileTap={{ scale: 0.97 }}
    >
      {label}
      {count !== null && count > 0 && (
        <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5
          ${active ? "bg-white/25 text-white" : "bg-primary/10 text-primary"}`}>
          {count}
        </span>
      )}
    </motion.button>
  );
}

// ── Category chips (on card) ──────────────────────────────────────────────────

function CategoryChips({ categories, lang, dark = false }: { categories: Category[]; lang: Lang; dark?: boolean }) {
  if (!categories.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((cat) => (
        <span key={cat.id}
          className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full
            ${dark
              ? "bg-white/15 text-white border border-white/25 backdrop-blur-sm"
              : "bg-primary/10 text-primary border border-primary/20"
            }`}
        >
          {getCategoryName(cat, lang)}
        </span>
      ))}
    </div>
  );
}

// ── Animated preview ──────────────────────────────────────────────────────────

function AnimatedPreview({ preview, className }: { preview: AnimPreview; className?: string }) {
  if (preview.isVideo) {
    return <video src={preview.url} className={className} autoPlay muted loop playsInline preload="auto" />;
  }
  return <img src={preview.url} alt="" className={className} />;
}

// ── Featured card ─────────────────────────────────────────────────────────────

function FeaturedCard({ project, lang }: { project: Project; lang: Lang }) {
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
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      {...linkProps}
      className={`group block relative rounded-2xl overflow-hidden border border-[#e8e8e8]
                  hover:border-primary/30 hover:shadow-[0_20px_80px_-16px_rgba(0,0,0,0.18)]
                  transition-all duration-400 bg-[#0c0c0c]
                  ${isLink ? "cursor-pointer" : "cursor-default"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-[21/9] md:aspect-[3/1] relative overflow-hidden">
        {thumb && (
          <img
            src={thumb}
            alt={title}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700
                        ${hovered && preview ? "opacity-0 scale-[1.03]" : "opacity-90 group-hover:scale-[1.02]"}`}
            loading="eager"
          />
        )}
        {hovered && preview && (
          <AnimatedPreview preview={preview} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
        {hasAnimatedMedia(project) && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full
                          bg-black/50 backdrop-blur-sm border border-white/15">
            <Film className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Preview</span>
          </div>
        )}
        {isLink && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center
                            opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100
                            transition-all duration-300 shadow-2xl shadow-primary/40">
              <Play className="w-6 h-6 ml-0.5 text-white" fill="white" />
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary
                                 text-white text-[10px] font-bold uppercase tracking-widest">
                  {t(i18n.portfolio.featured, lang)}
                </span>
                <CategoryChips categories={project.categories ?? []} lang={lang} dark />
              </div>
              <h3 className="font-display font-bold text-2xl md:text-4xl text-white
                             group-hover:text-primary transition-colors duration-200 leading-tight">
                {title}
              </h3>
              {desc && (
                <p className="text-white/60 font-light mt-1 max-w-2xl line-clamp-2 text-sm md:text-base">
                  {desc}
                </p>
              )}
            </div>
            {isLink && (
              <ExternalLink className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mb-1" />
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

// ── Regular card ──────────────────────────────────────────────────────────────

function ProjectCard({ project, lang }: { project: Project; lang: Lang }) {
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
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      {...linkProps}
      className={`group block rounded-2xl overflow-hidden border border-[#e8e8e8]
                  hover:border-primary/30 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.13)]
                  transition-all duration-300 bg-white
                  ${isLink ? "cursor-pointer" : "cursor-default"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-video relative overflow-hidden bg-[#0c0c0c]">
        {thumb && (
          <img
            src={thumb}
            alt={title}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-600
                        ${hovered && preview ? "opacity-0" : "opacity-90 group-hover:scale-[1.04]"}`}
            loading="lazy"
          />
        )}
        {hovered && preview && (
          <AnimatedPreview preview={preview} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
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
        {isLink && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center
                            opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100
                            transition-all duration-300 shadow-xl shadow-primary/40">
              <Play className="w-4 h-4 ml-0.5 text-white" fill="white" />
            </div>
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        {(project.categories ?? []).length > 0 && (
          <CategoryChips categories={project.categories ?? []} lang={lang} />
        )}
        <h4 className="font-display font-bold text-[#141414] text-sm leading-snug
                       group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {title}
        </h4>
        {desc && (
          <p className="text-[#888] text-xs line-clamp-2 leading-relaxed font-light">
            {desc}
          </p>
        )}
      </div>
    </Wrapper>
  );
}

// ── Portfolio page ────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const { lang } = useLanguage();
  const { data: allProjects, isLoading: loadingProjects } = useListProjects();
  const { data: allCategories = [] } = useListCategories();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const activeProjects = useMemo(
    () =>
      [...(allProjects ?? [])]
        .filter((p) => p.isActive !== false)
        .sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return a.sortOrder - b.sortOrder || a.id - b.id;
        }),
    [allProjects]
  );

  const { usedCategories, counts } = useMemo(() => {
    const used = new Map<number, number>();
    activeProjects.forEach((p) =>
      (p.categories ?? []).forEach((c) => used.set(c.id, (used.get(c.id) ?? 0) + 1))
    );
    const filtered = allCategories
      .filter((c) => used.has(c.id))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    return { usedCategories: filtered, counts: used };
  }, [allCategories, activeProjects]);

  const filtered = useMemo(() => {
    if (activeFilter === null) return activeProjects;
    return activeProjects.filter((p) =>
      (p.categories ?? []).some((c) => c.slug === activeFilter)
    );
  }, [activeProjects, activeFilter]);

  const [featured, ...rest] = filtered;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#141414] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <Link href="/">
            <motion.span
              whileHover={{ x: -3 }}
              className="inline-flex items-center gap-2 text-white/50 hover:text-white
                         text-sm font-medium cursor-pointer transition-colors duration-200 mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              {t(i18n.servicesPage.backToHome, lang)}
            </motion.span>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-primary text-xs font-bold uppercase tracking-[0.16em] mb-3">
              {t(i18n.portfolio.label, lang)}
            </p>
            <h1 className="font-display font-black text-white text-4xl md:text-6xl lg:text-7xl leading-[0.95]">
              {t(i18n.portfolio.heading, lang)}
            </h1>
          </motion.div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12 md:py-20 bg-[#2e6876]">
        {/* Category filters */}
        {usedCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 overflow-x-auto pb-1 -mx-1 px-1"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <FilterPill
                label={t(i18n.form.filterAll, lang)}
                count={null}
                active={activeFilter === null}
                onClick={() => setActiveFilter(null)}
              />
              {usedCategories.map((cat) => (
                <FilterPill
                  key={cat.slug}
                  label={getCategoryName(cat, lang)}
                  count={counts.get(cat.id) ?? 0}
                  active={activeFilter === cat.slug}
                  onClick={() => setActiveFilter(cat.slug)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {loadingProjects && (
          <div className="space-y-5">
            <div className="aspect-[3/1] rounded-2xl bg-[#f0f0f0] animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl bg-[#f0f0f0] animate-pulse aspect-video" />
              ))}
            </div>
          </div>
        )}

        {!loadingProjects && (
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-24 text-[#bbb] text-sm"
              >
                {lang === "ru"
                  ? "Проектов в этой категории нет."
                  : lang === "tj"
                  ? "Лоиҳаҳо дар ин категория нестанд."
                  : "No projects in this category."}
              </motion.div>
            ) : (
              <motion.div key="content" className="space-y-5">
                {featured && (
                  <AnimatePresence mode="popLayout">
                    <FeaturedCard key={`feat-${featured.id}`} project={featured} lang={lang} />
                  </AnimatePresence>
                )}
                {rest.length > 0 && (
                  <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AnimatePresence mode="popLayout">
                      {rest.map((project) => (
                        <ProjectCard key={project.id} project={project} lang={lang} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
