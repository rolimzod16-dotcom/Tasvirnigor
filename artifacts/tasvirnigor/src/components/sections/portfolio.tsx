import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ExternalLink } from "lucide-react";
import { useLanguage, type Lang } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { localize } from "@/lib/localize";
import { ensureProtocol } from "@/lib/utils";
import { useListProjects, useListCategories } from "@workspace/api-client-react";
import type { Project, Category } from "@workspace/api-client-react";

// ── Localisation helper ───────────────────────────────────────────────────────

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
}: {
  categories: Category[];
  active: string | null;
  onChange: (slug: string | null) => void;
  lang: Lang;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterPill
        label={t(i18n.form.filterAll, lang)}
        active={active === null}
        onClick={() => onChange(null)}
      />
      {categories.map((cat) => (
        <FilterPill
          key={cat.slug}
          label={getCategoryName(cat, lang)}
          active={active === cat.slug}
          onClick={() => onChange(cat.slug)}
        />
      ))}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      layout
      onClick={onClick}
      className={`relative px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200
        ${active
          ? "bg-primary text-white shadow-sm"
          : "bg-white text-[#555] border border-[#e0e0e0] hover:border-primary/40 hover:text-primary"
        }`}
      whileTap={{ scale: 0.97 }}
    >
      {label}
    </motion.button>
  );
}

// ── Category chips on a card ──────────────────────────────────────────────────

function CategoryChips({ categories, lang }: { categories: Category[]; lang: Lang }) {
  if (!categories.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((cat) => (
        <span
          key={cat.id}
          className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5
                     rounded-full bg-primary/10 text-primary border border-primary/20"
        >
          {getCategoryName(cat, lang)}
        </span>
      ))}
    </div>
  );
}

// ── Featured project card ─────────────────────────────────────────────────────

function FeaturedCard({ project, lang }: { project: Project; lang: Lang }) {
  return (
    <motion.a
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      href={ensureProtocol(project.youtubeUrl) ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative rounded-2xl overflow-hidden border border-[#e8e8e8]
                 hover:border-primary/30 hover:shadow-[0_16px_64px_-16px_rgba(0,0,0,0.16)]
                 transition-all duration-400"
    >
      <div className="aspect-[21/9] md:aspect-[3/1] relative overflow-hidden bg-[#0c0c0c]">
        <img
          src={project.bannerUrl}
          alt={localize(project as unknown as Record<string, unknown>, "title", lang) as string}
          className="w-full h-full object-cover transition-transform duration-700
                     group-hover:scale-[1.03] opacity-90"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center
                          opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100
                          transition-all duration-300 shadow-2xl">
            <Play className="w-6 h-6 ml-0.5 text-white" fill="white" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary
                                 text-white text-[10px] font-bold uppercase tracking-widest">
                  {t(i18n.portfolio.featured, lang)}
                </span>
                {(project.categories ?? []).map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full
                               bg-white/15 text-white text-[10px] font-bold uppercase tracking-widest
                               backdrop-blur-sm border border-white/20"
                  >
                    {getCategoryName(cat, lang)}
                  </span>
                ))}
              </div>
              <h3 className="font-display font-bold text-2xl md:text-4xl text-white
                             group-hover:text-primary transition-colors duration-200 leading-tight">
                {localize(project as unknown as Record<string, unknown>, "title", lang)}
              </h3>
              {localize(project as unknown as Record<string, unknown>, "description", lang) && (
                <p className="text-white/65 font-light mt-1 max-w-2xl line-clamp-2 text-sm md:text-base">
                  {localize(project as unknown as Record<string, unknown>, "description", lang)}
                </p>
              )}
            </div>
            <ExternalLink className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mb-1" />
          </div>
        </div>
      </div>
    </motion.a>
  );
}

// ── Regular project card ──────────────────────────────────────────────────────

function ProjectCard({ project, lang }: { project: Project; lang: Lang }) {
  return (
    <motion.a
      layout
      key={project.id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      href={ensureProtocol(project.youtubeUrl) ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl overflow-hidden border border-[#e8e8e8]
                 hover:border-primary/30 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)]
                 transition-all duration-300 bg-white"
    >
      <div className="aspect-video relative overflow-hidden bg-[#0c0c0c]">
        <img
          src={project.bannerUrl}
          alt={localize(project as unknown as Record<string, unknown>, "title", lang) as string}
          className="w-full h-full object-cover transition-transform duration-600
                     group-hover:scale-[1.05] opacity-90"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center
                          opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100
                          transition-all duration-300 shadow-xl">
            <Play className="w-4 h-4 ml-0.5 text-white" fill="white" />
          </div>
        </div>
      </div>
      <div className="p-5 space-y-2">
        {(project.categories ?? []).length > 0 && (
          <CategoryChips categories={project.categories ?? []} lang={lang} />
        )}
        <h4 className="font-display font-bold text-[#141414] text-base
                       group-hover:text-primary transition-colors duration-200 line-clamp-1">
          {localize(project as unknown as Record<string, unknown>, "title", lang)}
        </h4>
        {localize(project as unknown as Record<string, unknown>, "description", lang) && (
          <p className="text-[#888] text-sm line-clamp-2 leading-relaxed font-light">
            {localize(project as unknown as Record<string, unknown>, "description", lang)}
          </p>
        )}
      </div>
    </motion.a>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function Skeletons() {
  return (
    <div className="space-y-5">
      <div className="aspect-[3/1] rounded-2xl bg-[#f0f0f0] animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
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

  // Only show active projects, sorted by sortOrder
  const activeProjects = useMemo(
    () =>
      [...(allProjects ?? [])]
        .filter((p) => p.isActive !== false)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [allProjects]
  );

  // Derive only categories that are actually in use
  const usedCategories = useMemo(() => {
    const used = new Set<number>();
    activeProjects.forEach((p) => (p.categories ?? []).forEach((c) => used.add(c.id)));
    return allCategories
      .filter((c) => used.has(c.id))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
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
          <p className="text-[#888] text-sm md:text-right max-w-xs leading-relaxed font-light">
            {t(i18n.portfolio.clickHint, lang)}
          </p>
        </motion.div>

        {/* Filter tabs */}
        {usedCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 overflow-x-auto pb-1"
          >
            <FilterTabs
              categories={usedCategories}
              active={activeFilter}
              onChange={setActiveFilter}
              lang={lang}
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
              {lang === "ru" ? "Проектов в этой категории нет." : lang === "tj" ? "Лоиҳаҳо дар ин категория нестанд." : "No projects in this category."}
            </motion.div>
          ) : (
            <motion.div key="content" className="space-y-5">
              {featured && (
                <FeaturedCard key={`feat-${featured.id}`} project={featured} lang={lang} />
              )}
              {rest.length > 0 && (
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
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
