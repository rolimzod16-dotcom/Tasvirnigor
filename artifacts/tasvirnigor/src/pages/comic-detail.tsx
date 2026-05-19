import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight, BookMarked } from "lucide-react";
import { useGetComic } from "@workspace/api-client-react";
import { useLanguage } from "@/contexts/language-context";
import { localize } from "@/lib/localize";
import { i18n, t } from "@/lib/i18n";
import type { Chapter, Category } from "@workspace/api-client-react";

function getLang(obj: Record<string, unknown>, field: string, lang: string): string {
  return (localize(obj, field, lang as "en" | "ru" | "tj") as string) ?? "";
}

function CategoryChips({ cats, lang }: { cats: Category[]; lang: string }) {
  if (!cats.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {cats.map((c) => (
        <span key={c.id}
          className="text-[11px] font-bold uppercase tracking-widest bg-primary/10 text-primary
                     rounded-full px-3 py-1 border border-primary/20">
          {getLang(c as unknown as Record<string, unknown>, "name", lang) || c.name}
        </span>
      ))}
    </div>
  );
}

function ChapterRow({
  chapter,
  index,
  comicId,
  lang,
}: {
  chapter: Chapter;
  index: number;
  comicId: number;
  lang: string;
}) {
  const [, navigate] = useLocation();
  const title = getLang(chapter as unknown as Record<string, unknown>, "title", lang) || chapter.title;

  return (
    <motion.button
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate(`/comics/${comicId}/read/${chapter.id}`)}
      className="group w-full flex items-center gap-4 p-4 rounded-xl border border-[#e8e8e8]
                 hover:border-primary/30 hover:bg-primary/3 transition-all duration-200 text-left"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0
                      group-hover:bg-primary group-hover:text-white transition-colors">
        <BookMarked className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#141414] group-hover:text-primary transition-colors truncate">
          {title}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-[#bbb] group-hover:text-primary transition-colors shrink-0" />
    </motion.button>
  );
}

export function ComicDetail() {
  const { comicId } = useParams<{ comicId: string }>();
  const [, navigate] = useLocation();
  const { lang } = useLanguage();
  const comicIdNum = Number(comicId);

  const { data: comic, isLoading } = useGetComic(comicIdNum, { query: { enabled: !!comicIdNum } });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-[#888]">
        {t(i18n.comics.notFound, lang)}
      </div>
    );
  }

  const title = getLang(comic as unknown as Record<string, unknown>, "title", lang) || comic.title;
  const desc = getLang(comic as unknown as Record<string, unknown>, "description", lang);
  const sortedChapters = [...(comic.chapters ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
  );
  const firstChapter = sortedChapters[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Back nav */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-[#f0f0f0]">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate("/#comics")}
            className="flex items-center gap-1.5 text-[#555] hover:text-[#141414] transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            {t(i18n.comics.backToComics, lang)}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-10 md:py-16">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12">
          {/* Cover */}
          <div className="w-full md:w-56 shrink-0">
            <div className="w-full md:w-56 aspect-[3/4] rounded-2xl overflow-hidden bg-[#0c0c0c] shadow-2xl shadow-black/15">
              {comic.coverUrl ? (
                <img src={comic.coverUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white/20" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <CategoryChips cats={comic.categories ?? []} lang={lang} />
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-[#141414] leading-tight">
              {title}
            </h1>
            {desc && (
              <p className="text-[#666] leading-relaxed text-base font-light">{desc}</p>
            )}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-sm text-[#888]">
                {comic.chapterCount} {t(i18n.comics.chapters, lang)}
              </span>
            </div>

            {firstChapter && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/comics/${comicIdNum}/read/${firstChapter.id}`)}
                className="inline-flex items-center gap-2 bg-primary text-white font-semibold
                           px-7 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                <BookOpen className="w-4 h-4" />
                {t(i18n.comics.startReading, lang)}
              </motion.button>
            )}
          </div>
        </div>

        {/* Chapter list */}
        {sortedChapters.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-xl text-[#141414] mb-4">
              {t(i18n.comics.chapterList, lang)}
            </h2>
            <div className="space-y-2">
              {sortedChapters.map((ch, i) => (
                <ChapterRow
                  key={ch.id}
                  chapter={ch}
                  index={i}
                  comicId={comicIdNum}
                  lang={lang}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
