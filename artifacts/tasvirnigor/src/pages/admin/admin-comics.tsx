import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import {
  useListComics, useCreateComic, useUpdateComic, useDeleteComic,
  getListComicsQueryKey,
  useGetComic, getGetComicQueryKey,
  useCreateChapter, useUpdateChapter, useDeleteChapter,
  useListCategories,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Edit2, Trash2, ChevronUp, ChevronDown, BookOpen, BookMarked,
  Eye, EyeOff, Loader2, Upload, X, Image as ImageIcon, BookText,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import type { Comic, Chapter, ComicPage } from "@workspace/api-client-react";

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE FILE UPLOAD (comic cover)
// ─────────────────────────────────────────────────────────────────────────────

function CoverUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/comic-cover", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onChange(json.url!);
    } catch (e) {
      toast({ variant: "destructive", title: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-start gap-4">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="w-28 aspect-[3/4] rounded-xl border-2 border-dashed border-border/50
                   hover:border-primary/40 bg-muted/20 flex items-center justify-center
                   cursor-pointer overflow-hidden transition-colors shrink-0"
      >
        {value ? (
          <img src={value} className="w-full h-full object-cover" alt="cover" />
        ) : uploading ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground text-center p-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">Cover</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 text-xs"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="w-3 h-3" />
          {uploading ? "Uploading…" : value ? "Change Cover" : "Upload Cover"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-destructive hover:text-destructive"
            onClick={() => onChange(null)}
          >
            <X className="w-3 h-3 mr-1" /> Remove
          </Button>
        )}
        <p className="text-[10px] text-muted-foreground">JPG · PNG · WebP · max 10 MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE MANAGER (upload + reorder + delete for a chapter)
// ─────────────────────────────────────────────────────────────────────────────

function PageManager({ chapterId }: { chapterId: number }) {
  const { toast } = useToast();
  const { lang } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pages, setPages] = useState<ComicPage[] | null>(null);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chapters/${chapterId}`);
      const json = (await res.json()) as { pages?: ComicPage[] };
      const sorted = [...(json.pages ?? [])].sort(
        (a: ComicPage, b: ComicPage) => a.sortOrder - b.sortOrder || a.id - b.id
      );
      setPages(sorted);
    } catch {
      toast({ variant: "destructive", title: "Failed to load pages" });
    }
  }, [chapterId, toast]);

  useEffect(() => {
    void fetchPages();
  }, [fetchPages]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const baseOrder = pages?.length ?? 0;
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          const r = await fetch("/api/upload/comic-page", { method: "POST", body: fd });
          const j = (await r.json()) as { url?: string; error?: string };
          if (!r.ok) throw new Error(j.error ?? "Upload failed");
          return j.url!;
        })
      );
      const addRes = await fetch(`/api/chapters/${chapterId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages: uploaded.map((url, i) => ({ imageUrl: url, sortOrder: baseOrder + i })),
        }),
      });
      if (!addRes.ok) throw new Error("Failed to save pages");
      toast({ title: `${uploaded.length} page${uploaded.length > 1 ? "s" : ""} uploaded` });
      await fetchPages();
    } catch (e) {
      toast({ variant: "destructive", title: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const deletePage = async (id: number) => {
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    setPages((prev) => prev?.filter((p) => p.id !== id) ?? null);
    toast({ title: t(i18n.form.pageDeleted, lang) });
  };

  const movePage = async (idx: number, dir: "up" | "down") => {
    if (!pages) return;
    const next = [...pages];
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target]!, next[idx]!];
    const reordered = next.map((p, i) => ({ ...p, sortOrder: i }));
    setPages(reordered);
    await fetch("/api/pages/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pages: reordered.map((p) => ({ id: p.id, sortOrder: p.sortOrder })) }),
    });
  };

  if (pages === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2
                   cursor-pointer hover:border-primary/40 hover:bg-primary/3 transition-all
                   border-border/50 bg-muted/10"
      >
        {uploading ? (
          <>
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading pages…</p>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 text-muted-foreground" />
            <p className="text-sm font-medium">{t(i18n.form.uploadPages, lang)}</p>
            <p className="text-xs text-muted-foreground">
              JPG · PNG · WebP · select multiple files at once
            </p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Page list */}
      {pages.length > 0 ? (
        <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
          <p className="text-xs text-muted-foreground font-medium">{pages.length} pages uploaded</p>
          {pages.map((page, idx) => (
            <div
              key={page.id}
              className="flex items-center gap-3 p-2 rounded-lg border border-border/50
                         hover:border-primary/20 bg-card"
            >
              <div className="w-10 h-14 rounded-md overflow-hidden bg-muted shrink-0">
                <img
                  src={page.imageUrl}
                  alt={`Page ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 shrink-0">#{idx + 1}</span>
              <div className="flex-1" />
              <div className="flex items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={idx === 0}
                  onClick={() => void movePage(idx, "up")}
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={idx === pages.length - 1}
                  onClick={() => void movePage(idx, "down")}
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm("Delete this page?")) void deletePage(page.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-6 text-sm text-muted-foreground">
          No pages yet — upload some above.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER MANAGER
// ─────────────────────────────────────────────────────────────────────────────

function ChapterManager({ comic, onClose }: { comic: Comic; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { lang } = useLanguage();
  const [, navigate] = useLocation();

  const { data: comicData, isLoading } = useGetComic(comic.id);
  const createMut = useCreateChapter();
  const updateMut = useUpdateChapter();
  const deleteMut = useDeleteChapter();

  const [pagesChapterId, setPagesChapterId] = useState<number | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: getGetComicQueryKey(comic.id) });

  const chapters = [...(comicData?.chapters ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
  );

  const addChapter = async () => {
    if (!newTitle.trim()) return;
    await createMut.mutateAsync({
      id: comic.id,
      data: { title: newTitle.trim(), sortOrder: chapters.length },
    });
    await invalidate();
    toast({ title: t(i18n.form.chapterCreated, lang) });
    setNewTitle("");
    setShowAddForm(false);
  };

  const saveEdit = async () => {
    if (!editingChapter || !editTitle.trim()) return;
    await updateMut.mutateAsync({ id: editingChapter.id, data: { title: editTitle.trim() } });
    await invalidate();
    toast({ title: t(i18n.form.chapterUpdated, lang) });
    setEditingChapter(null);
    setEditTitle("");
  };

  const deleteChapter = async (id: number) => {
    if (!confirm(t(i18n.form.deleteChapterConfirm, lang))) return;
    await deleteMut.mutateAsync({ id });
    await invalidate();
    toast({ title: t(i18n.form.chapterDeleted, lang) });
  };

  const moveChapter = async (idx: number, dir: "up" | "down") => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= chapters.length) return;
    const a = chapters[idx]!;
    const b = chapters[target]!;
    await Promise.all([
      updateMut.mutateAsync({ id: a.id, data: { sortOrder: b.sortOrder } }),
      updateMut.mutateAsync({ id: b.id, data: { sortOrder: a.sortOrder } }),
    ]);
    await invalidate();
  };

  // Pages sub-view
  if (pagesChapterId !== null) {
    const ch = chapters.find((c) => c.id === pagesChapterId);
    return (
      <div>
        <button
          onClick={() => setPagesChapterId(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronUp className="w-4 h-4 -rotate-90" /> Back to chapters
        </button>
        <h3 className="text-sm font-semibold mb-3">Pages — {ch?.title}</h3>
        <PageManager chapterId={pagesChapterId} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Add chapter form */}
      {showAddForm ? (
        <div className="flex items-center gap-2 p-3 border border-primary/20 rounded-xl bg-primary/3">
          <Input
            placeholder="Chapter title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") void addChapter();
              if (e.key === "Escape") setShowAddForm(false);
            }}
          />
          <Button
            size="sm"
            className="h-8 shrink-0"
            onClick={() => void addChapter()}
            disabled={createMut.isPending || !newTitle.trim()}
          >
            {createMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 shrink-0"
            onClick={() => setShowAddForm(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 h-9"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-3.5 h-3.5" /> {t(i18n.form.addChapter, lang)}
        </Button>
      )}

      {/* Chapter list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : chapters.length === 0 ? (
        <p className="text-center py-6 text-sm text-muted-foreground">No chapters yet.</p>
      ) : (
        <div className="space-y-1.5 max-h-[52vh] overflow-y-auto pr-0.5">
          {chapters.map((ch, idx) => (
            <div
              key={ch.id}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-border/50 bg-card
                         hover:border-primary/20 transition-colors"
            >
              <BookMarked className="w-4 h-4 text-primary shrink-0" />

              {editingChapter?.id === ch.id ? (
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="h-7 text-sm flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void saveEdit();
                    if (e.key === "Escape") setEditingChapter(null);
                  }}
                />
              ) : (
                <span className="text-sm font-medium flex-1 truncate">{ch.title}</span>
              )}

              <div className="flex items-center gap-0.5 shrink-0">
                {editingChapter?.id === ch.id ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => void saveEdit()}
                      disabled={updateMut.isPending}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7"
                      onClick={() => setEditingChapter(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Manage pages"
                      onClick={() => setPagesChapterId(ch.id)}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Read"
                      onClick={() => navigate(`/comics/${comic.id}/read/${ch.id}`)}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={idx === 0}
                      onClick={() => void moveChapter(idx, "up")}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={idx === chapters.length - 1}
                      onClick={() => void moveChapter(idx, "down")}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingChapter(ch);
                        setEditTitle(ch.title);
                      }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={deleteMut.isPending}
                      onClick={() => void deleteChapter(ch.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMIC FORM DIALOG
// ─────────────────────────────────────────────────────────────────────────────

type ComicFormValues = {
  title: string;
  titleRu: string;
  titleTj: string;
  description: string;
  descriptionRu: string;
  descriptionTj: string;
  coverUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  categoryIds: number[];
};

const COMIC_EMPTY: ComicFormValues = {
  title: "",
  titleRu: "",
  titleTj: "",
  description: "",
  descriptionRu: "",
  descriptionTj: "",
  coverUrl: null,
  isActive: true,
  sortOrder: 0,
  categoryIds: [],
};

const comicSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleRu: z.string().default(""),
  titleTj: z.string().default(""),
  description: z.string().default(""),
  descriptionRu: z.string().default(""),
  descriptionTj: z.string().default(""),
  coverUrl: z.string().nullable().default(null),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
  categoryIds: z.array(z.number()).default([]),
});

function ComicFormDialog({
  open,
  editing,
  onClose,
  categories,
}: {
  open: boolean;
  editing: Comic | null;
  onClose: () => void;
  categories: { id: number; name: string; slug: string; sortOrder: number }[];
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { lang } = useLanguage();
  const createMut = useCreateComic();
  const updateMut = useUpdateComic();

  const form = useForm<ComicFormValues>({
    resolver: zodResolver(comicSchema),
    defaultValues: COMIC_EMPTY,
  });

  // Sync form when the dialog opens or the editing target changes
  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.reset({
        title: editing.title,
        titleRu: editing.titleRu ?? "",
        titleTj: editing.titleTj ?? "",
        description: editing.description ?? "",
        descriptionRu: editing.descriptionRu ?? "",
        descriptionTj: editing.descriptionTj ?? "",
        coverUrl: editing.coverUrl ?? null,
        isActive: editing.isActive,
        sortOrder: editing.sortOrder,
        categoryIds: (editing.categories ?? []).map((c) => c.id),
      });
    } else {
      form.reset(COMIC_EMPTY);
    }
  }, [open, editing, form]);

  const invalidate = () => qc.invalidateQueries({ queryKey: getListComicsQueryKey() });

  const onSubmit = async (values: ComicFormValues) => {
    const data = {
      title: values.title,
      titleRu: values.titleRu || null,
      titleTj: values.titleTj || null,
      description: values.description || null,
      descriptionRu: values.descriptionRu || null,
      descriptionTj: values.descriptionTj || null,
      coverUrl: values.coverUrl || null,
      isActive: values.isActive,
      sortOrder: values.sortOrder,
      categoryIds: values.categoryIds,
    };
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, data });
      toast({ title: t(i18n.form.comicUpdated, lang) });
    } else {
      await createMut.mutateAsync({ data });
      toast({ title: t(i18n.form.comicCreated, lang) });
    }
    await invalidate();
    form.reset(COMIC_EMPTY);
    onClose();
  };

  const watchedCategoryIds = form.watch("categoryIds");
  const toggleCat = (id: number) => {
    const cur = form.getValues("categoryIds");
    form.setValue(
      "categoryIds",
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  };

  const sortedCats = [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          form.reset(COMIC_EMPTY);
          onClose();
        }
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[92vh] overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {editing ? t(i18n.form.editComic, lang) : t(i18n.form.addComic, lang)}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Cover */}
            <FormField
              control={form.control}
              name="coverUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t(i18n.form.coverImage, lang)}</FormLabel>
                  <FormControl>
                    <CoverUpload value={field.value ?? null} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Multilingual title + description */}
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <Tabs defaultValue="en">
                <TabsList className="w-full rounded-none border-b border-border/50 bg-card/60 h-auto p-1 gap-1">
                  {(["en", "ru", "tj"] as const).map((l) => (
                    <TabsTrigger
                      key={l}
                      value={l}
                      className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold"
                    >
                      {t(
                        l === "en"
                          ? i18n.langLabels.english
                          : l === "ru"
                          ? i18n.langLabels.russian
                          : i18n.langLabels.tajik,
                        lang
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="p-4">
                  {(
                    [
                      {
                        tab: "en",
                        titleField: "title" as const,
                        descField: "description" as const,
                        badge: "(EN) *",
                      },
                      {
                        tab: "ru",
                        titleField: "titleRu" as const,
                        descField: "descriptionRu" as const,
                        badge: "(RU)",
                      },
                      {
                        tab: "tj",
                        titleField: "titleTj" as const,
                        descField: "descriptionTj" as const,
                        badge: "(TJ)",
                      },
                    ] as const
                  ).map(({ tab, titleField, descField, badge }) => (
                    <TabsContent key={tab} value={tab} className="mt-0 space-y-4">
                      <FormField
                        control={form.control}
                        name={titleField}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t(i18n.form.title, lang)}{" "}
                              <span className="text-primary text-xs">{badge}</span>
                            </FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={descField}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t(i18n.form.description, lang)}{" "}
                              <span className="text-primary text-xs">
                                {badge.replace(" *", "")}
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                value={field.value ?? ""}
                                className="min-h-[80px]"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </div>

            {/* Categories */}
            {sortedCats.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  {t(i18n.form.assignCategories, lang)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sortedCats.map((cat) => {
                    const active = watchedCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCat(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                          ${
                            active
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-[#555] border-[#e0e0e0] hover:border-primary/40"
                          }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sort order + visibility */}
            <div className="flex flex-wrap items-end gap-6">
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[100px]">
                    <FormLabel>{t(i18n.form.sortOrder, lang)}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="w-28" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 pb-0.5">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal">
                      {t(i18n.form.projectIsActive, lang)}
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {createMut.isPending || updateMut.isPending
                ? t(i18n.form.saving, lang)
                : editing
                ? t(i18n.form.comicUpdated, lang)
                : t(i18n.form.addComic, lang)}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN COMICS (main list)
// ─────────────────────────────────────────────────────────────────────────────

export function AdminComics() {
  const { data: comics = [], isLoading } = useListComics();
  const { data: categories = [] } = useListCategories();
  const deleteMut = useDeleteComic();
  const updateMut = useUpdateComic();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { lang } = useLanguage();

  const [formOpen, setFormOpen] = useState(false);
  const [editingComic, setEditingComic] = useState<Comic | null>(null);
  const [chaptersComic, setChaptersComic] = useState<Comic | null>(null);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: getListComicsQueryKey() });

  const handleDelete = async (id: number) => {
    if (!confirm(t(i18n.form.deleteComicConfirm, lang))) return;
    await deleteMut.mutateAsync({ id });
    await invalidate();
    toast({ title: t(i18n.form.comicDeleted, lang) });
  };

  const handleToggleActive = async (comic: Comic) => {
    await updateMut.mutateAsync({ id: comic.id, data: { isActive: !comic.isActive } });
    await invalidate();
  };

  const handleMove = async (comic: Comic, dir: "up" | "down") => {
    const sorted = [...comics].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const idx = sorted.findIndex((c) => c.id === comic.id);
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= sorted.length) return;
    const other = sorted[target]!;
    await Promise.all([
      updateMut.mutateAsync({ id: comic.id, data: { sortOrder: other.sortOrder } }),
      updateMut.mutateAsync({ id: other.id, data: { sortOrder: comic.sortOrder } }),
    ]);
    await invalidate();
  };

  const sorted = [...comics].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display flex items-center gap-2">
          <BookText className="w-5 h-5 text-primary" />
          {t(i18n.admin.comics, lang)}
        </CardTitle>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingComic(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4" /> {t(i18n.form.addComic, lang)}
        </Button>
      </CardHeader>

      <CardContent>
        {sorted.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground text-sm">
            No comics yet. Click &ldquo;{t(i18n.form.addComic, lang)}&rdquo; to create the first one.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sorted.map((comic, idx) => (
              <div
                key={comic.id}
                className={`rounded-xl border overflow-hidden bg-card flex flex-col
                            transition-all hover:border-primary/40
                            ${comic.isActive ? "border-border/50" : "border-border/30 opacity-60"}`}
              >
                {/* Cover */}
                <div className="aspect-[3/4] relative bg-[#0c0c0c] overflow-hidden">
                  {comic.coverUrl ? (
                    <img
                      src={comic.coverUrl}
                      alt={comic.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                  {!comic.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <EyeOff className="w-5 h-5 text-white/60" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2">
                    <span className="text-[9px] font-bold text-white bg-black/70 rounded-full px-1.5 py-0.5">
                      {comic.chapterCount ?? 0} ch
                    </span>
                  </div>
                </div>

                {/* Info + actions */}
                <div className="p-2.5 flex-1 flex flex-col gap-1.5">
                  <p className="text-xs font-semibold leading-tight line-clamp-2">{comic.title}</p>
                  {(comic.categories ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-0.5">
                      {(comic.categories ?? []).slice(0, 2).map((c) => (
                        <span
                          key={c.id}
                          className="text-[8px] font-bold uppercase tracking-wider
                                     bg-primary/10 text-primary rounded-full px-1.5 py-0.5"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-0.5 mt-auto pt-1 flex-wrap">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      title={t(i18n.form.manageChapters, lang)}
                      onClick={() => setChaptersComic(comic)}
                    >
                      <BookMarked className="w-3.5 h-3.5 text-primary" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={idx === 0}
                      onClick={() => void handleMove(comic, "up")}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={idx === sorted.length - 1}
                      onClick={() => void handleMove(comic, "down")}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => void handleToggleActive(comic)}
                    >
                      {comic.isActive ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingComic(comic);
                        setFormOpen(true);
                      }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      disabled={deleteMut.isPending}
                      onClick={() => void handleDelete(comic.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Comic form dialog */}
      <ComicFormDialog
        open={formOpen}
        editing={editingComic}
        onClose={() => {
          setFormOpen(false);
          setEditingComic(null);
        }}
        categories={categories}
      />

      {/* Chapters manager dialog */}
      <Dialog
        open={!!chaptersComic}
        onOpenChange={(v) => {
          if (!v) setChaptersComic(null);
        }}
      >
        <DialogContent
          className="max-w-xl max-h-[88vh] overflow-y-auto"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-primary" />
              {t(i18n.form.manageChapters, lang)} — {chaptersComic?.title}
            </DialogTitle>
          </DialogHeader>
          {chaptersComic && (
            <ChapterManager
              comic={chaptersComic}
              onClose={() => setChaptersComic(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
