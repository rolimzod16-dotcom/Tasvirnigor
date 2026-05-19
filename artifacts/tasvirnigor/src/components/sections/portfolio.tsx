import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ExternalLink, Film } from "lucide-react";
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

// ── Category filter tabs ──────────────────────────────────────────────────────

function FilterTabs({
  categories,
  active,
  onChange,
  lang,
  counts,
}: {
  categories: Category[];
  active: string | null;
  onChange: (slug: string | null) => void;
  lang: Lang;
  counts: Map<number, number>;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterPill
        label={t(i18n.form.filterAll, lang)}
        count={null}
        active={active === null}
        onClick={() => onChange(null)}
      />
      {categories.map((cat) => (
        <FilterPill
          key={cat.slug}
          label={getCategoryName(cat, lang)}
          count={counts.get(cat.id) ?? 0}
          active={active === cat.slug}
          onClick={() => onChange(cat.slug)}
        />
      ))}
    </div>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number | null;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      layout
      onClick={onClick}
      className={`relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold
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

// ── Category chips ────────────────────────────────────────────────────────────

function CategoryChips({ categories, lang, dark = false }: { categories: Category[]; lang: Lang; dark?: boolean }) {
  if (!categories.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((cat) => (
        <span
          key={cat.id}
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

// ── Featured project card ─────────────────────────────────────────────────────

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
        {/* Static thumbnail */}
        {thumb && (
          <img
            src={thumb}
            alt={title}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700
                        ${hovered && preview ? "opacity-0 scale-[1.03]" : "opacity-90 group-hover:scale-[1.02]"}`}
            loading="eager"
          />
        )}

        {/* Animated preview on hover */}
        {hovered && preview && (
          <AnimatedPreview
            preview={preview}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

        {/* Animated media badge */}
        {hasAnimatedMedia(project) && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full
                          bg-black/50 backdrop-blur-sm border border-white/15">
            <Film className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Preview</span>
          </div>
        )}

        {/* Play button - YouTube only */}
        {isLink && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center
                            opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100
                            transition-all duration-300 shadow-2xl shadow-primary/40">
              <Play className="w-6 h-6 ml-0.5 text-white" fill="white" />
            </div>
          </div>
        )}

        {/* Content overlay */}
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

// ── Regular project card ──────────────────────────────────────────────────────

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
      {/* Media area */}
      <div className="aspect-video relative overflow-hidden bg-[#0c0c0c]">
        {/* Static thumbnail */}
        {thumb && (
          <img
            src={thumb}
            alt={title}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-600
                        ${hovered && preview ? "opacity-0" : "opacity-90 group-hover:scale-[1.04]"}`}
            loading="lazy"
          />
        )}

        {/* Animated preview on hover */}
        {hovered && preview && (
          <AnimatedPreview
            preview={preview}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Overlay badges */}
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

        {/* Play button - YouTube only */}
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

      {/* Text area */}
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

// ── Skeleton loader ───────────────────────────────────────────────────────────

function Skeletons() {
  return (
    <div className="space-y-5">
      <div className="aspect-[3/1] rounded-2xl bg-[#f0f0f0] animate-pulse" />
      <div className="flex flex-wrap gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-[#f0f0f0] animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl bg-[#f0f0f0] animate-pulse aspect-video" />
        ))}
      </div>
    </div>
  );
}

// ── Public section ────────────────────────────────────────────────────────────

export function Portfolio() {
  const { lang } = useLanguage();
  const { data: allProjects, isLoading: loadingProjects } = useListProjects();
  const { data: allCategories = [] } = useListCategories();

  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const activeProjects = useMemo(
    () =>
      [...(allProjects ?? [])]
        .filter((p) => p.isActive !== false)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [allProjects]
  );

  // Derive only categories actually in use (with per-category counts)
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

  if (loadingProjects) {
    return (
      <section id="portfolio" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <Skeletons />
        </div>
      </section>
    );
  }

  if (!activeProjects.length) return null;

  return (
    <section id="portfolio" className="py-24 md:py-32 bg-white">
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
            <p className="section-label">{t(i18n.portfolio.label, lang)}</p>
            <h2 className="section-heading text-[#141414]">
              {t(i18n.portfolio.heading, lang)}
            </h2>
          </div>
          {activeProjects.some((p) => p.youtubeUrl) && (
            <p className="text-[#888] text-sm md:text-right max-w-xs leading-relaxed font-light">
              {t(i18n.portfolio.clickHint, lang)}
            </p>
          )}
        </motion.div>

        {/* Filter tabs */}
        {usedCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 overflow-x-auto pb-1 -mx-1 px-1"
          >
            <FilterTabs
              categories={usedCategories}
              active={activeFilter}
              onChange={(slug) => {
                setActiveFilter(slug);
              }}
              lang={lang}
              counts={counts}
            />
          </motion.div>
        )}

        {/* Cards */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-[#bbb] text-sm"
            >
              {lang === "ru"
                ? "Проектов в этой категории нет."
                : lang === "tj"
                ? "Лоиҳаҳо дар ин категория нестанд."
                : "No projects in this category."}
            </motion.div>
          ) : (
            <motion.div key="content" className="space-y-5">
              {/* Featured project */}
              {featured && (
                <AnimatePresence mode="popLayout">
                  <FeaturedCard key={`feat-${featured.id}`} project={featured} lang={lang} />
                </AnimatePresence>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
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
      </div>
    </section>
  );
}
