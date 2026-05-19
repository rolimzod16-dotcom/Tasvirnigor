import { useMemo, useState } from "react";
import {
  useListProjects, useCreateProject, useUpdateProject, useDeleteProject, getListProjectsQueryKey,
  useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, getListCategoriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, Tag, Eye, EyeOff, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import type { Project, Category } from "@workspace/api-client-react";

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY MANAGER
// ─────────────────────────────────────────────────────────────────────────────

function CategoryManager() {
  const { data: categories = [], isLoading } = useListCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { lang } = useLanguage();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const catSchema = z.object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Lowercase, numbers, hyphens only"),
    name: z.string().min(1),
    nameRu: z.string().optional().nullable(),
    nameTj: z.string().optional().nullable(),
    sortOrder: z.coerce.number().default(0),
  });

  type CatForm = z.infer<typeof catSchema>;

  const form = useForm<CatForm>({
    resolver: zodResolver(catSchema),
    defaultValues: { slug: "", name: "", nameRu: "", nameTj: "", sortOrder: 0 },
  });

  const reset = () => { form.reset(); setEditingId(null); setShowForm(false); };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    form.reset({ slug: cat.slug, name: cat.name, nameRu: cat.nameRu ?? "", nameTj: cat.nameTj ?? "", sortOrder: cat.sortOrder });
    setShowForm(true);
  };

  const onSubmit = (values: CatForm) => {
    const data = { ...values, nameRu: values.nameRu || null, nameTj: values.nameTj || null };
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data }, {
        onSuccess: () => { invalidate(); toast({ title: t(i18n.form.categoryUpdated, lang) }); reset(); },
        onError: (e) => toast({ variant: "destructive", title: e instanceof Error ? e.message : "Error" }),
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => { invalidate(); toast({ title: t(i18n.form.categoryCreated, lang) }); reset(); },
        onError: (e) => toast({ variant: "destructive", title: e instanceof Error ? e.message : "Error" }),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm(t(i18n.form.deleteCategoryConfirm, lang))) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => { invalidate(); toast({ title: t(i18n.form.categoryDeleted, lang) }); },
    });
  };

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  return (
    <div className="border border-border/40 rounded-xl bg-card/40 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">{t(i18n.form.categories, lang)}</h3>
          <span className="text-xs text-muted-foreground">({categories.length})</span>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"
          onClick={() => { if (showForm && editingId === null) { reset(); } else { setEditingId(null); setShowForm(true); form.reset(); } }}>
          {showForm && editingId === null ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {showForm && editingId === null ? "Cancel" : t(i18n.form.addCategory, lang)}
        </Button>
      </div>

      {/* Category chips list */}
      {!isLoading && sorted.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {sorted.map((cat) => (
            <div key={cat.id}
              className="group flex items-center gap-1 px-2.5 py-1 rounded-full border border-border/50
                         bg-white text-xs font-medium hover:border-primary/30 transition-colors">
              <span>{cat.name}</span>
              <span className="text-muted-foreground text-[10px]">/{cat.slug}</span>
              <button onClick={() => startEdit(cat)}
                className="opacity-0 group-hover:opacity-100 ml-1 hover:text-primary transition-all">
                <Edit2 className="w-3 h-3" />
              </button>
              <button onClick={() => handleDelete(cat.id)}
                className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                disabled={deleteMutation.isPending}>
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inline category form */}
      {showForm && (
        <form onSubmit={form.handleSubmit(onSubmit)}
          className="border border-border/50 rounded-lg p-3 bg-background space-y-2.5">
          <p className="text-xs font-semibold text-muted-foreground">
            {editingId !== null ? t(i18n.form.editCategory, lang) : t(i18n.form.addCategory, lang)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t(i18n.form.categorySlug, lang)}</label>
              <Input {...form.register("slug")} placeholder="e.g. 3d-animation" className="h-8 text-xs" />
              {form.formState.errors.slug && (
                <p className="text-xs text-destructive mt-0.5">{form.formState.errors.slug.message}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t(i18n.form.categoryName, lang)} (EN)</label>
              <Input {...form.register("name")} placeholder="3D Animation" className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t(i18n.form.categoryName, lang)} (RU)</label>
              <Input {...form.register("nameRu")} className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t(i18n.form.categoryName, lang)} (TJ)</label>
              <Input {...form.register("nameTj")} className="h-8 text-xs" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Sort Order</label>
              <Input {...form.register("sortOrder")} type="number" className="h-8 text-xs w-20" />
            </div>
            <Button type="submit" size="sm" className="h-8 mt-4"
              disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId !== null ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 mt-4" onClick={reset}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT FORM TYPES
// ─────────────────────────────────────────────────────────────────────────────

type ProjectFormValues = {
  title: string; titleRu: string | null; titleTj: string | null;
  description: string | null; descriptionRu: string | null; descriptionTj: string | null;
  youtubeUrl: string; bannerUrl: string;
  isActive: boolean;
  categoryIds: number[];
  sortOrder: number;
};

const EMPTY: ProjectFormValues = {
  title: "", titleRu: "", titleTj: "",
  description: "", descriptionRu: "", descriptionTj: "",
  youtubeUrl: "", bannerUrl: "",
  isActive: true,
  categoryIds: [],
  sortOrder: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PROJECTS
// ─────────────────────────────────────────────────────────────────────────────

export function AdminProjects() {
  const { data: projects = [], isLoading } = useListProjects();
  const { data: allCategories = [] } = useListCategories();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lang } = useLanguage();

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const projectSchema = useMemo(
    () =>
      z.object({
        title: z.string().min(1, t(i18n.validation.titleRequired, lang)),
        titleRu: z.string().optional().nullable(),
        titleTj: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        descriptionRu: z.string().optional().nullable(),
        descriptionTj: z.string().optional().nullable(),
        youtubeUrl: z.string().url(t(i18n.validation.urlInvalid, lang)),
        bannerUrl: z.string().min(1, t(i18n.validation.bannerRequired, lang)),
        isActive: z.boolean().default(true),
        categoryIds: z.array(z.number()).default([]),
        sortOrder: z.coerce.number().default(0),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang]
  );

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: EMPTY,
  });

  const resetForm = () => { form.reset(EMPTY); setEditingProject(null); };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.reset({
      title: project.title, titleRu: project.titleRu ?? "", titleTj: project.titleTj ?? "",
      description: project.description ?? "", descriptionRu: project.descriptionRu ?? "",
      descriptionTj: project.descriptionTj ?? "",
      youtubeUrl: project.youtubeUrl, bannerUrl: project.bannerUrl,
      isActive: project.isActive ?? true,
      categoryIds: (project.categories ?? []).map((c) => c.id),
      sortOrder: project.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });

  const onSubmit = (values: ProjectFormValues) => {
    const data = {
      ...values,
      titleRu: values.titleRu || null, titleTj: values.titleTj || null,
      description: values.description || null,
      descriptionRu: values.descriptionRu || null, descriptionTj: values.descriptionTj || null,
    };
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data }, {
        onSuccess: () => { invalidate(); toast({ title: t(i18n.form.projectUpdated, lang) }); setIsDialogOpen(false); resetForm(); },
        onError: (e) => toast({ variant: "destructive", title: e instanceof Error ? e.message : "Error" }),
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => { invalidate(); toast({ title: t(i18n.form.projectCreated, lang) }); setIsDialogOpen(false); resetForm(); },
        onError: (e) => toast({ variant: "destructive", title: e instanceof Error ? e.message : "Error" }),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(t(i18n.form.deleteProjectConfirm, lang))) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => { invalidate(); toast({ title: t(i18n.form.projectDeleted, lang) }); },
      });
    }
  };

  const handleToggleActive = (project: Project) => {
    updateMutation.mutate({ id: project.id, data: { isActive: !project.isActive } }, {
      onSuccess: () => invalidate(),
    });
  };

  const handleMove = (project: Project, dir: "up" | "down") => {
    const sorted = [...projects].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const idx = sorted.findIndex((p) => p.id === project.id);
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const target = sorted[targetIdx];
    Promise.all([
      updateMutation.mutateAsync({ id: project.id, data: { sortOrder: target.sortOrder } }),
      updateMutation.mutateAsync({ id: target.id, data: { sortOrder: project.sortOrder } }),
    ]).then(() => invalidate());
  };

  const watchedCategoryIds = form.watch("categoryIds");

  const toggleCategory = (id: number) => {
    const current = form.getValues("categoryIds");
    form.setValue("categoryIds",
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
      { shouldDirty: true }
    );
  };

  if (isLoading) return <div className="text-muted-foreground">{t(i18n.form.loadingProjects, lang)}</div>;

  const sorted = [...projects].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  const sortedCats = [...allCategories].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display">{t(i18n.admin.projects, lang)}</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> {t(i18n.form.addProject, lang)}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card border-border max-h-[92vh] overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingProject ? t(i18n.form.editProject, lang) : t(i18n.form.addProject, lang)}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                {/* Banner upload */}
                <FormField control={form.control} name="bannerUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.form.bannerImage, lang)}</FormLabel>
                    <FormControl>
                      <FileUpload value={field.value} onChange={field.onChange} endpoint="/api/upload/project-banner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Multilingual fields */}
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <Tabs defaultValue="en">
                    <TabsList className="w-full rounded-none border-b border-border/50 bg-card/60 h-auto p-1 gap-1">
                      {(["en", "ru", "tj"] as const).map((l) => (
                        <TabsTrigger key={l} value={l}
                          className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold">
                          {t(l === "en" ? i18n.langLabels.english : l === "ru" ? i18n.langLabels.russian : i18n.langLabels.tajik, lang)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <div className="p-4 space-y-4">
                      <TabsContent value="en" className="mt-0 space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.title, lang)} <span className="text-primary text-xs">(EN) *</span></FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.description, lang)} <span className="text-primary text-xs">(EN)</span></FormLabel>
                            <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[80px]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TabsContent>
                      <TabsContent value="ru" className="mt-0 space-y-4">
                        <FormField control={form.control} name="titleRu" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.title, lang)} <span className="text-primary text-xs">(RU)</span></FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="descriptionRu" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.description, lang)} <span className="text-primary text-xs">(RU)</span></FormLabel>
                            <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[80px]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TabsContent>
                      <TabsContent value="tj" className="mt-0 space-y-4">
                        <FormField control={form.control} name="titleTj" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.title, lang)} <span className="text-primary text-xs">(TJ)</span></FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="descriptionTj" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.description, lang)} <span className="text-primary text-xs">(TJ)</span></FormLabel>
                            <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[80px]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                {/* YouTube URL */}
                <FormField control={form.control} name="youtubeUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.form.youtubeUrl, lang)}</FormLabel>
                    <FormControl><Input {...field} placeholder={t(i18n.form.youtubePlaceholder, lang)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Category assignment */}
                {sortedCats.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">{t(i18n.form.assignCategories, lang)}</p>
                    <div className="flex flex-wrap gap-2">
                      {sortedCats.map((cat) => {
                        const checked = watchedCategoryIds.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                              ${checked
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

                {/* Sort + visibility */}
                <div className="flex flex-wrap items-end gap-6">
                  <FormField control={form.control} name="sortOrder" render={({ field }) => (
                    <FormItem className="flex-1 min-w-[100px]">
                      <FormLabel>{t(i18n.form.sortOrder, lang)}</FormLabel>
                      <FormControl><Input type="number" {...field} className="w-28" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 pb-0.5">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        {t(i18n.form.projectIsActive, lang)}
                      </FormLabel>
                    </FormItem>
                  )} />
                </div>

                <Button type="submit" className="w-full"
                  disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending)
                    ? t(i18n.form.saving, lang)
                    : editingProject
                    ? t(i18n.form.updateProject, lang)
                    : t(i18n.form.createProject, lang)}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <CategoryManager />

        {sorted.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground text-sm">
            No projects yet. Click &ldquo;Add Project&rdquo; to create the first one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((project, idx) => (
              <div key={project.id}
                className={`group relative rounded-xl border overflow-hidden bg-card flex flex-col
                            transition-all hover:border-primary/40
                            ${project.isActive ? "border-border/50" : "border-border/30 opacity-60"}`}
              >
                <div className="aspect-video relative bg-[#0c0c0c]">
                  <img src={project.bannerUrl} alt={project.title}
                    className="w-full h-full object-cover" loading="lazy" />
                  {!project.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <EyeOff className="w-5 h-5 text-white/70" />
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col gap-1.5">
                  <div className="flex items-start gap-2">
                    <p className="text-sm font-semibold leading-tight line-clamp-1 flex-1">{project.title}</p>
                    {!project.isActive && (
                      <Badge variant="outline" className="text-[10px] px-1.5 shrink-0 text-muted-foreground">Hidden</Badge>
                    )}
                  </div>
                  {(project.categories ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(project.categories ?? []).map((c) => (
                        <span key={c.id}
                          className="text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary rounded-full px-2 py-0.5">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-auto pt-1.5">
                    <Button variant="outline" size="icon" className="h-7 w-7"
                      title={t(i18n.form.moveUp, lang)} disabled={idx === 0 || updateMutation.isPending}
                      onClick={() => handleMove(project, "up")}>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7"
                      title={t(i18n.form.moveDown, lang)} disabled={idx === sorted.length - 1 || updateMutation.isPending}
                      onClick={() => handleMove(project, "down")}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7"
                      title={project.isActive ? "Hide" : "Show"} onClick={() => handleToggleActive(project)}
                      disabled={updateMutation.isPending}>
                      {project.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </Button>
                    <div className="flex-1" />
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleEdit(project)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-7 w-7"
                      disabled={deleteMutation.isPending} onClick={() => handleDelete(project.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
