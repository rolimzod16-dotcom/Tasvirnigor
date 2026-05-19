import { useMemo, useState } from "react";
import {
  useListPartners,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
  getListPartnersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import type { Partner } from "@workspace/api-client-react";

type PartnerFormValues = {
  name: string;
  description: string | null;
  descriptionRu: string | null;
  descriptionTj: string | null;
  websiteUrl: string | null;
  logoUrl: string;
  sortOrder: number;
};

const EMPTY: PartnerFormValues = {
  name: "",
  description: "",
  descriptionRu: "",
  descriptionTj: "",
  websiteUrl: "",
  logoUrl: "",
  sortOrder: 0,
};

export function AdminPartners() {
  const { data: partners = [], isLoading } = useListPartners();
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lang } = useLanguage();

  const createMutation = useCreatePartner();
  const updateMutation = useUpdatePartner();
  const deleteMutation = useDeletePartner();

  const partnerSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t(i18n.form.partnerNameRequired, lang)),
        description: z.string().optional().nullable(),
        descriptionRu: z.string().optional().nullable(),
        descriptionTj: z.string().optional().nullable(),
        websiteUrl: z.string().optional().nullable(),
        logoUrl: z.string().min(1, t(i18n.form.logoRequired, lang)),
        sortOrder: z.coerce.number().default(0),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang]
  );

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: EMPTY,
  });

  const resetForm = () => { form.reset(EMPTY); setEditingPartner(null); };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    form.reset({
      name: partner.name,
      description: partner.description ?? "",
      descriptionRu: partner.descriptionRu ?? "",
      descriptionTj: partner.descriptionTj ?? "",
      websiteUrl: partner.websiteUrl ?? "",
      logoUrl: partner.logoUrl,
      sortOrder: partner.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: PartnerFormValues) => {
    const data = {
      ...values,
      description: values.description || null,
      descriptionRu: values.descriptionRu || null,
      descriptionTj: values.descriptionTj || null,
      websiteUrl: values.websiteUrl || null,
    };
    if (editingPartner) {
      updateMutation.mutate({ id: editingPartner.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPartnersQueryKey() });
          toast({ title: t(i18n.form.partnerUpdated, lang) });
          setIsDialogOpen(false); resetForm();
        },
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPartnersQueryKey() });
          toast({ title: t(i18n.form.partnerCreated, lang) });
          setIsDialogOpen(false); resetForm();
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(t(i18n.form.deletePartnerConfirm, lang))) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPartnersQueryKey() });
          toast({ title: t(i18n.form.partnerDeleted, lang) });
        },
      });
    }
  };

  if (isLoading) return <div className="text-muted-foreground">{t(i18n.form.loadingPartners, lang)}</div>;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display">{t(i18n.admin.partners, lang)}</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> {t(i18n.form.addPartner, lang)}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingPartner ? t(i18n.form.editPartner, lang) : t(i18n.form.addPartner, lang)}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="logoUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.form.partnerLogo, lang)}</FormLabel>
                    <FormControl>
                      <FileUpload value={field.value} onChange={field.onChange} endpoint="/api/upload/partner-logo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.form.partnerName, lang)}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
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
                    <div className="p-4">
                      <TabsContent value="en" className="mt-0">
                        <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.description, lang)} <span className="text-primary text-xs">(EN)</span></FormLabel>
                            <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[72px]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TabsContent>
                      <TabsContent value="ru" className="mt-0">
                        <FormField control={form.control} name="descriptionRu" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.description, lang)} <span className="text-primary text-xs">(RU)</span></FormLabel>
                            <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[72px]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TabsContent>
                      <TabsContent value="tj" className="mt-0">
                        <FormField control={form.control} name="descriptionTj" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.description, lang)} <span className="text-primary text-xs">(TJ)</span></FormLabel>
                            <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[72px]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                <FormField control={form.control} name="websiteUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.form.websiteUrl, lang)}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder={t(i18n.form.websitePlaceholder, lang)} />
                    </FormControl>
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
                  {editingPartner ? t(i18n.form.updatePartner, lang) : t(i18n.form.createPartner, lang)}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {partners.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t(i18n.partners.empty, lang)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="group relative rounded-xl border border-border/50 bg-card p-4 flex flex-col items-center gap-3 hover:border-primary/40 transition-all"
              >
                <div className="w-full h-16 flex items-center justify-center">
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="max-h-12 max-w-[120px] w-auto h-auto object-contain"
                  />
                </div>
                <p className="text-xs font-semibold text-center truncate w-full">{partner.name}</p>
                {partner.websiteUrl && (
                  <a
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-primary/60 hover:text-primary flex items-center gap-1 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>Website</span>
                  </a>
                )}
                <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                  <Button variant="secondary" size="icon" className="w-7 h-7" onClick={() => handleEdit(partner)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="destructive" size="icon" className="w-7 h-7" onClick={() => handleDelete(partner.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
