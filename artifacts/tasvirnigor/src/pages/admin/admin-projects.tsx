import { useMemo, useState } from "react";
import { useListProjects, useCreateProject, useUpdateProject, useDeleteProject, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import type { Project } from "@workspace/api-client-react";

type ProjectFormValues = {
  title: string; titleRu: string | null; titleTj: string | null;
  description: string | null; descriptionRu: string | null; descriptionTj: string | null;
  youtubeUrl: string; bannerUrl: string; sortOrder: number;
};

const EMPTY: ProjectFormValues = {
  title: "", titleRu: "", titleTj: "",
  description: "", descriptionRu: "", descriptionTj: "",
  youtubeUrl: "", bannerUrl: "", sortOrder: 0,
};

export function AdminProjects() {
  const { data: projects = [], isLoading } = useListProjects();
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
      description: project.description ?? "", descriptionRu: project.descriptionRu ?? "", descriptionTj: project.descriptionTj ?? "",
      youtubeUrl: project.youtubeUrl, bannerUrl: project.bannerUrl, sortOrder: project.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: ProjectFormValues) => {
    const data = {
      ...values,
      titleRu: values.titleRu || null, titleTj: values.titleTj || null,
      description: values.description || null,
      descriptionRu: values.descriptionRu || null, descriptionTj: values.descriptionTj || null,
    };
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          toast({ title: t(i18n.form.projectUpdated, lang) });
          setIsDialogOpen(false); resetForm();
        },
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          toast({ title: t(i18n.form.projectCreated, lang) });
          setIsDialogOpen(false); resetForm();
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(t(i18n.form.deleteProjectConfirm, lang))) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          toast({ title: t(i18n.form.projectDeleted, lang) });
        },
      });
    }
  };

  if (isLoading) return <div className="text-muted-foreground">{t(i18n.form.loadingProjects, lang)}</div>;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display">{t(i18n.admin.projects, lang)}</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> {t(i18n.form.addProject, lang)}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingProject ? t(i18n.form.editProject, lang) : t(i18n.form.addProject, lang)}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="bannerUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.form.bannerImage, lang)}</FormLabel>
                    <FormControl>
                      <FileUpload value={field.value} onChange={field.onChange} endpoint="/api/upload/project-banner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <Tabs defaultValue="en">
                    <TabsList className="w-full rounded-none border-b border-border/50 bg-card/60 h-auto p-1 gap-1">
                      <TabsTrigger value="en" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold">
                        {t(i18n.langLabels.english, lang)}
                      </TabsTrigger>
                      <TabsTrigger value="ru" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold">
                        {t(i18n.langLabels.russian, lang)}
                      </TabsTrigger>
                      <TabsTrigger value="tj" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold">
                        {t(i18n.langLabels.tajik, lang)}
                      </TabsTrigger>
                    </TabsList>
                    <div className="p-4 space-y-4">
                      <TabsContent value="en" className="mt-0 space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.title, lang)} <span className="text-primary text-xs">(EN)</span></FormLabel>
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

                <FormField control={form.control} name="youtubeUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.form.youtubeUrl, lang)}</FormLabel>
                    <FormControl><Input {...field} placeholder={t(i18n.form.youtubePlaceholder, lang)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sortOrder" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.form.sortOrder, lang)}</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingProject ? t(i18n.form.updateProject, lang) : t(i18n.form.createProject, lang)}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="group relative rounded-lg border border-border/50 overflow-hidden bg-card transition-all hover:border-primary/50">
              <div className="aspect-video relative">
                <img src={project.bannerUrl} alt={project.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                  <Button variant="secondary" size="icon" onClick={() => handleEdit(project)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 truncate">{project.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                <div className="flex gap-1.5 mt-2">
                  {project.titleRu && <span className="text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">RU</span>}
                  {project.titleTj && <span className="text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">TJ</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
