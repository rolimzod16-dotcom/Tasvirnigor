import { useMemo, useState } from "react";
import {
  useListServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  getListServicesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload, type MediaType } from "@/components/ui/media-upload";
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, Image as ImageIcon, Film, FileJson } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import type { Service } from "@workspace/api-client-react";

type ServiceFormValues = {
  title: string;
  titleRu: string | null;
  titleTj: string | null;
  description: string | null;
  descriptionRu: string | null;
  descriptionTj: string | null;
  mediaUrl: string;
  mediaType: string;
  linkUrl: string | null;
  linkLabel: string | null;
  linkLabelRu: string | null;
  linkLabelTj: string | null;
  sortOrder: number;
};

const EMPTY: ServiceFormValues = {
  title: "",
  titleRu: "",
  titleTj: "",
  description: "",
  descriptionRu: "",
  descriptionTj: "",
  mediaUrl: "",
  mediaType: "image",
  linkUrl: "",
  linkLabel: "",
  linkLabelRu: "",
  linkLabelTj: "",
  sortOrder: 0,
};

function mediaTypeIcon(mt: string) {
  if (mt === "video") return <Film className="w-3.5 h-3.5" />;
  if (mt === "lottie") return <FileJson className="w-3.5 h-3.5" />;
  return <ImageIcon className="w-3.5 h-3.5" />;
}

function ServiceThumb({ service }: { service: Service }) {
  const mt = service.mediaType;
  return (
    <div className="w-full aspect-video bg-[#111] rounded-lg overflow-hidden relative">
      {mt === "video" ? (
        <video
          src={service.mediaUrl}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
      ) : mt === "lottie" ? (
        <div className="w-full h-full flex items-center justify-center">
          <FileJson className="w-8 h-8 text-primary/60" />
        </div>
      ) : (
        <img
          src={service.mediaUrl}
          alt={service.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-black/60 text-white/80 flex items-center gap-1">
        {mediaTypeIcon(mt)}
        {mt}
      </span>
    </div>
  );
}

export function AdminServices() {
  const { data: services = [], isLoading } = useListServices();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lang } = useLanguage();

  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const serviceSchema = useMemo(
    () =>
      z.object({
        title: z.string().min(1, t(i18n.form.serviceTitleRequired, lang)),
        titleRu: z.string().optional().nullable(),
        titleTj: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        descriptionRu: z.string().optional().nullable(),
        descriptionTj: z.string().optional().nullable(),
        mediaUrl: z.string().min(1, t(i18n.form.serviceMediaRequired, lang)),
        mediaType: z.string().default("image"),
        linkUrl: z.string().optional().nullable(),
        linkLabel: z.string().optional().nullable(),
        linkLabelRu: z.string().optional().nullable(),
        linkLabelTj: z.string().optional().nullable(),
        sortOrder: z.coerce.number().default(0),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang]
  );

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: EMPTY,
  });

  const resetForm = () => { form.reset(EMPTY); setEditingService(null); };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.reset({
      title: service.title,
      titleRu: service.titleRu ?? "",
      titleTj: service.titleTj ?? "",
      description: service.description ?? "",
      descriptionRu: service.descriptionRu ?? "",
      descriptionTj: service.descriptionTj ?? "",
      mediaUrl: service.mediaUrl,
      mediaType: service.mediaType,
      linkUrl: service.linkUrl ?? "",
      linkLabel: service.linkLabel ?? "",
      linkLabelRu: service.linkLabelRu ?? "",
      linkLabelTj: service.linkLabelTj ?? "",
      sortOrder: service.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: ServiceFormValues) => {
    const data = {
      ...values,
      titleRu: values.titleRu || null,
      titleTj: values.titleTj || null,
      description: values.description || null,
      descriptionRu: values.descriptionRu || null,
      descriptionTj: values.descriptionTj || null,
      linkUrl: values.linkUrl || null,
      linkLabel: values.linkLabel || null,
      linkLabelRu: values.linkLabelRu || null,
      linkLabelTj: values.linkLabelTj || null,
    };
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
          toast({ title: t(i18n.form.serviceUpdated, lang) });
          setIsDialogOpen(false); resetForm();
        },
        onError: (err) => {
          toast({ variant: "destructive", title: err instanceof Error ? err.message : "Update failed" });
        },
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
          toast({ title: t(i18n.form.serviceCreated, lang) });
          setIsDialogOpen(false); resetForm();
        },
        onError: (err) => {
          toast({ variant: "destructive", title: err instanceof Error ? err.message : "Create failed" });
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(t(i18n.form.deleteServiceConfirm, lang))) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
          toast({ title: t(i18n.form.serviceDeleted, lang) });
        },
      });
    }
  };

  const handleMove = (service: Service, dir: "up" | "down") => {
    const sorted = [...services].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const idx = sorted.findIndex((s) => s.id === service.id);
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const target = sorted[targetIdx];
    const myOrder = service.sortOrder;
    const theirOrder = target.sortOrder;
    Promise.all([
      updateMutation.mutateAsync({ id: service.id, data: { sortOrder: theirOrder } }),
      updateMutation.mutateAsync({ id: target.id, data: { sortOrder: myOrder } }),
    ]).then(() => queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() }));
  };

  if (isLoading) return <div className="text-muted-foreground">{t(i18n.form.loadingServices, lang)}</div>;

  const sorted = [...services].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display">{t(i18n.admin.services, lang)}</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> {t(i18n.form.addService, lang)}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card border-border max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingService ? t(i18n.form.editService, lang) : t(i18n.form.addService, lang)}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                {/* Media upload */}
                <FormField control={form.control} name="mediaUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.form.serviceMedia, lang)}</FormLabel>
                    <FormControl>
                      <MediaUpload
                        value={field.value}
                        mediaType={form.watch("mediaType") as MediaType}
                        onChange={(url, mt) => {
                          field.onChange(url);
                          form.setValue("mediaType", mt);
                        }}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">{t(i18n.form.serviceMediaHint, lang)}</p>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Multilingual title */}
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
                      <TabsContent value="en" className="mt-0 space-y-3">
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
                      <TabsContent value="ru" className="mt-0 space-y-3">
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
                      <TabsContent value="tj" className="mt-0 space-y-3">
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

                {/* Optional link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="linkUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.linkUrl, lang)}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="linkLabel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.linkLabel, lang)} (EN)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="Learn more" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="linkLabelRu" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.linkLabel, lang)} (RU)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="Узнать больше" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="linkLabelTj" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.linkLabel, lang)} (TJ)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="Бештар донед" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="sortOrder" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.form.sortOrder, lang)}</FormLabel>
                    <FormControl><Input type="number" {...field} className="w-28" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending)
                    ? t(i18n.form.saving, lang)
                    : editingService
                    ? t(i18n.form.updateService, lang)
                    : t(i18n.form.createService, lang)}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {sorted.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground text-sm">
            No services yet. Click &ldquo;Add Service&rdquo; to create the first one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((service, idx) => (
              <div
                key={service.id}
                className="group relative rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/40 transition-all flex flex-col"
              >
                <ServiceThumb service={service} />
                <div className="p-3 flex-1 flex flex-col gap-1.5">
                  <p className="text-sm font-semibold leading-tight line-clamp-2">{service.title}</p>
                  {service.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 font-light">{service.description}</p>
                  )}
                  {service.linkUrl && (
                    <p className="text-[10px] text-primary/60 truncate">{service.linkUrl}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-auto pt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      title={t(i18n.form.moveUp, lang)}
                      disabled={idx === 0 || updateMutation.isPending}
                      onClick={() => handleMove(service, "up")}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      title={t(i18n.form.moveDown, lang)}
                      disabled={idx === sorted.length - 1 || updateMutation.isPending}
                      onClick={() => handleMove(service, "down")}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                    <div className="flex-1" />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDelete(service.id)}
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
    </Card>
  );
}
