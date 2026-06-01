import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, BookMarked } from "lucide-react";
import { useListComics, useListCategories } from "@workspace/api-client-react";
import type { Comic, Category } from "@workspace/api-client-react";
import { useLanguage, type Lang } from "@/contexts/language-context";
import { localize } from "@/lib/localize";
import { i18n, t } from "@/lib/i18n";

// ── Helpers ───────────────────────────────────────────────────────────────────

function loc(obj: Record<string, unknown>, field: string, lang: Lang): string {
  return (localize(obj, field, lang) as string) ?? "";
}

function getCatName(cat: Category, lang: Lang): string {
  return loc(cat as unknown as Record<string, unknown>, "name", lang) || cat.name;
}

// ── Filter tabs ───────────────────────────────────────────────────────────────

function FilterTabs({
  categories,
  active,
  onChange,
  lang,
  counts,
}: {
  categories: Category[];
  active: string | null;
  onChange: (s: string | null) => void;
  lang: Lang;
  counts: Map<number, number>;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterPill label={t(i18n.form.filterAll, lang)} count={null} active={active === null} onClick={() => onChange(null)} />
      {categories.map((cat) => (
        <FilterPill
          key={cat.slug}
          label={getCatName(cat, lang)}
          count={counts.get(cat.id) ?? 0}
          active={active === cat.slug}
          onClick={() => onChange(cat.slug)}
        />
      ))}
    </div>
  );
}

function FilterPill({ label, count, active, onClick }: { label: string; count: number | null; active: boolean; onClick: () => void }) {
  return (
    <motion.button layout onClick={onClick} whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold
                  transition-colors duration-200 select-none
                  ${active ? "bg-primary text-white shadow-md shadow-primary/20"
                           : "bg-white text-[#555] border border-[#e0e0e0] hover:border-primary/40 hover:text-primary"}`}
    >
      {label}
      {count !== null && count > 0 && (
        <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5
          ${active ? "bg-white/25 text-white" : "bg-primary/10 text-primary"}`}>{count}</span>
      )}
    </motion.button>
  );
}

// ── Comic card ────────────────────────────────────────────────────────────────

function ComicCard({ comic, lang }: { comic: Comic; lang: Lang }) {
  const [, navigate] = useLocation();
  const title = loc(comic as unknown as Record<string, unknown>, "title", lang) || comic.title;
  const desc = loc(comic as unknown as Record<string, unknown>, "description", lang);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate(`/comics/${comic.id}`)}
      className="group cursor-pointer rounded-2xl overflow-hidden border border-[#e8e8e8]
                 hover:border-primary/30 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.13)]
                 transition-all duration-300 bg-white flex flex-col"
    >
      {/* Cover */}
      <div className="aspect-[3/4] relative overflow-hidden bg-[#0c0c0c]">
        {comic.coverUrl ? (
          <img
            src={comic.coverUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category chips on cover */}
        {(comic.categories ?? []).length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {(comic.categories ?? []).slice(0, 2).map((c) => (
              <span key={c.id}
                className="text-[9px] font-bold uppercase tracking-widest text-white
                           bg-black/60 backdrop-blur-sm border border-white/15 rounded-full px-2 py-0.5">
                {getCatName(c, lang)}
              </span>
            ))}
          </div>
        )}

        {/* Read button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-primary text-white font-semibold text-sm px-5 py-2.5 rounded-xl
                          flex items-center gap-2 shadow-xl">
            <BookOpen className="w-4 h-4" />
            {t(i18n.comics.readNow, lang)}
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="p-4 flex-1 flex flex-col gap-1.5">
        <h4 className="font-display font-bold text-[#141414] text-sm leading-snug
                       group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {title}
        </h4>
        {desc && (
          <p className="text-[#888] text-xs line-clamp-2 leading-relaxed font-light">{desc}</p>
        )}
        <div className="flex items-center gap-1.5 mt-auto pt-1 text-[#aaa]">
          <BookMarked className="w-3 h-3" />
          <span className="text-[10px] font-semibold">
            {comic.chapterCount} {t(i18n.comics.chapters, lang)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function Skeletons() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-[#f0f0f0]">
          <div className="aspect-[3/4] bg-[#f0f0f0] animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-[#f0f0f0] rounded animate-pulse w-3/4" />
            <div className="h-2 bg-[#f5f5f5] rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Public section ────────────────────────────────────────────────────────────

export function Comics() {
  const { lang } = useLanguage();
  const { data: allComics, isLoading } = useListComics();
  const { data: allCategories = [] } = useListCategories();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const active = useMemo(
    () =>
      [...(allComics ?? [])]
        .filter((c) => c.isActive !== false)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [allComics]
  );

  const { usedCategories, counts } = useMemo(() => {
    const used = new Map<number, number>();
    active.forEach((c) => (c.categories ?? []).forEach((cat) => used.set(cat.id, (used.get(cat.id) ?? 0) + 1)));
    const filtered = allCategories
      .filter((c) => used.has(c.id))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    return { usedCategories: filtered, counts: used };
  }, [allCategories, active]);

  const filtered = useMemo(() => {
    if (activeFilter === null) return active;
    return active.filter((c) => (c.categories ?? []).some((cat) => cat.slug === activeFilter));
  }, [active, activeFilter]);

  if (isLoading) {
    return (
      <section id="comics" className="py-24 md:py-32 bg-[#f9f8f6]">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <Skeletons />
        </div>
      </section>
    );
  }

  if (!active.length) return null;

  return (
    <section id="comics" className="py-24 md:py-32 bg-[#f9f8f6]">
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
            <p className="section-label text-[19px] text-[#fffefc] bg-[#c38313]">{t(i18n.comics.label, lang)}</p>
            <h2 className="section-heading text-[#141414]">{t(i18n.comics.heading, lang)}</h2>
          </div>
          <p className="text-[#888] text-sm md:text-right max-w-xs leading-relaxed font-light">
            {t(i18n.comics.subtitle, lang)}
          </p>
        </motion.div>

        {/* Filters */}
        {usedCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 overflow-x-auto pb-1 -mx-1 px-1"
          >
            <FilterTabs categories={usedCategories} active={activeFilter} onChange={setActiveFilter} lang={lang} counts={counts} />
          </motion.div>
        )}

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-16 text-[#bbb] text-sm">
              {t(i18n.comics.noneInCategory, lang)}
            </motion.p>
          ) : (
            <motion.div
              key="grid"
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((comic) => (
                  <ComicCard key={comic.id} comic={comic} lang={lang} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
