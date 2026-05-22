import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, List, Maximize2, Minimize2, ArrowUp, Loader2
} from "lucide-react";
import { useGetChapter, useGetComic, getGetComicQueryKey, getGetChapterQueryKey } from "@workspace/api-client-react";
import { useLanguage } from "@/contexts/language-context";
import { localize } from "@/lib/localize";
import { i18n, t } from "@/lib/i18n";

// ── Image component with lazy loading ────────────────────────────────────────

function ComicPageImage({ url, index, total }: { url: string; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: "400px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full relative">
      {visible ? (
        <>
          {!loaded && (
            <div className="w-full aspect-[3/4] bg-[#1a1a1a] flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
            </div>
          )}
          <img
            src={url}
            alt={`Page ${index + 1}`}
            onLoad={() => setLoaded(true)}
            className={`w-full h-auto block transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0 absolute top-0"}`}
            loading="eager"
            draggable={false}
          />
        </>
      ) : (
        <div className="w-full aspect-[3/4] bg-[#1a1a1a]" />
      )}
    </div>
  );
}

// ── Chapter selector dropdown ─────────────────────────────────────────────────

function ChapterSelector({
  chapters,
  currentId,
  onSelect,
  lang,
}: {
  chapters: { id: number; title: string; titleRu?: string | null; titleTj?: string | null; sortOrder: number }[];
  currentId: number;
  onSelect: (id: number) => void;
  lang: string;
}) {
  const [open, setOpen] = useState(false);
  const current = chapters.find((c) => c.id === currentId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20
                   text-white text-sm font-medium transition-colors max-w-[220px] truncate"
      >
        <List className="w-4 h-4 shrink-0" />
        <span className="truncate">
          {current
            ? (localize(current as Record<string, unknown>, "title", lang as "en" | "ru" | "tj") as string) ?? current.title
            : "Select chapter"}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1 left-0 z-50 bg-[#1a1a1a] border border-white/10
                       rounded-xl shadow-2xl py-1 min-w-[220px] max-h-64 overflow-y-auto"
          >
            {[...chapters]
              .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
              .map((ch) => {
                const title = (localize(ch as Record<string, unknown>, "title", lang as "en" | "ru" | "tj") as string) ?? ch.title;
                return (
                  <button
                    key={ch.id}
                    onClick={() => { onSelect(ch.id); setOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/10
                               ${ch.id === currentId ? "text-primary font-semibold" : "text-white/80"}`}
                  >
                    {title}
                  </button>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}

// ── Main reader ───────────────────────────────────────────────────────────────

export function ComicReader() {
  const { comicId, chapterId } = useParams<{ comicId: string; chapterId: string }>();
  const [, navigate] = useLocation();
  const { lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [barsVisible, setBarsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const comicIdNum = Number(comicId);
  const chapterIdNum = Number(chapterId);

  const { data: comic } = useGetComic(comicIdNum, { query: { queryKey: getGetComicQueryKey(comicIdNum), enabled: !!comicIdNum } });
  const { data: chapter, isLoading } = useGetChapter(chapterIdNum, { query: { queryKey: getGetChapterQueryKey(chapterIdNum), enabled: !!chapterIdNum } });

  const chapters = comic?.chapters ?? [];
  const sortedChapters = [...chapters].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  const currentIdx = sortedChapters.findIndex((c) => c.id === chapterIdNum);
  const prevChapter = currentIdx > 0 ? sortedChapters[currentIdx - 1] : null;
  const nextChapter = currentIdx < sortedChapters.length - 1 ? sortedChapters[currentIdx + 1] : null;

  const pages = [...(chapter?.pages ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  const comicTitle = comic
    ? ((localize(comic as unknown as Record<string, unknown>, "title", lang) as string) ?? comic.title)
    : "";

  // Auto-hide bars on scroll
  const showBars = useCallback(() => {
    setBarsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setBarsVisible(false), 3000);
  }, []);

  useEffect(() => {
    showBars();
    return () => clearTimeout(hideTimer.current);
  }, [showBars]);

  // Scroll-to-top visibility
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) setShowTop(el.scrollTop > 400);
    showBars();
  }, [showBars]);

  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  // Fullscreen
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.().catch(() => {});
      setFullscreen(true);
    } else {
      await document.exitFullscreen?.().catch(() => {});
      setFullscreen(false);
    }
  };
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const goToChapter = (id: number) => navigate(`/comics/${comicIdNum}/read/${id}`);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0d0d0d] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0d0d0d] flex flex-col select-none"
      onMouseMove={showBars}
      onTouchStart={showBars}
    >
      {/* ── Top bar ── */}
      <AnimatePresence>
        {barsVisible && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute top-0 left-0 right-0 z-10 h-14 flex items-center gap-3 px-4
                       bg-gradient-to-b from-black/90 to-transparent"
          >
            {/* Back to comic */}
            <button
              onClick={() => navigate(`/comics/${comicIdNum}`)}
              className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-medium truncate max-w-[150px]">{comicTitle}</span>
            </button>

            <div className="flex-1 flex justify-center">
              {chapters.length > 1 && (
                <ChapterSelector
                  chapters={chapters}
                  currentId={chapterIdNum}
                  onSelect={goToChapter}
                  lang={lang}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white rounded-lg
                           hover:bg-white/10 transition-colors"
              >
                {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => navigate(`/comics/${comicIdNum}`)}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white rounded-lg
                           hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Scrollable reading area ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-[#2E6876]"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Page strip */}
        <div className="max-w-2xl mx-auto">
          {pages.length === 0 ? (
            <div className="flex items-center justify-center h-screen text-white/30 text-sm">
              {t(i18n.comics.noPagesYet, lang)}
            </div>
          ) : (
            pages.map((page, i) => (
              <ComicPageImage key={page.id} url={page.imageUrl} index={i} total={pages.length} />
            ))
          )}
          {/* Bottom padding for nav bar */}
          <div className="h-20" />
        </div>
      </div>
      {/* ── Bottom navigation bar ── */}
      <AnimatePresence>
        {barsVisible && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute bottom-0 left-0 right-0 z-10 h-16 flex items-center justify-between px-6
                       bg-gradient-to-t from-black/90 to-transparent"
          >
            <button
              onClick={() => prevChapter && goToChapter(prevChapter.id)}
              disabled={!prevChapter}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                         transition-all duration-200
                         disabled:opacity-30 disabled:cursor-not-allowed
                         text-white bg-white/10 hover:bg-white/20 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t(i18n.comics.prevChapter, lang)}</span>
            </button>

            <div className="text-white/40 text-xs font-medium">
              {pages.length > 0 && `${pages.length} ${t(i18n.comics.pages, lang)}`}
            </div>

            <button
              onClick={() => nextChapter && goToChapter(nextChapter.id)}
              disabled={!nextChapter}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                         transition-all duration-200
                         disabled:opacity-30 disabled:cursor-not-allowed
                         text-primary bg-primary/15 hover:bg-primary/25 active:scale-95"
            >
              <span className="hidden sm:inline">{t(i18n.comics.nextChapter, lang)}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Scroll to top ── */}
      <AnimatePresence>
        {showTop && barsVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="absolute right-4 bottom-20 z-10 w-10 h-10 rounded-full bg-white/10
                       hover:bg-white/20 flex items-center justify-center text-white
                       transition-colors shadow-lg"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
