import { useEffect, useMemo, useRef } from "react";
import { useGetContacts, useUpdateContacts, getGetContactsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";

type ContactsFormValues = {
  labelEn: string; labelRu: string; labelTj: string;
  headingEn: string; headingRu: string; headingTj: string;
  subtextEn: string; subtextRu: string; subtextTj: string;
  address: string; addressRu: string; addressTj: string;
  workingHoursEn: string; workingHoursRu: string; workingHoursTj: string;
  email: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  instagram: string;
  youtube: string;
  facebook: string;
};

const tabTriggerClass =
  "flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold";

export function AdminContacts() {
  const { data: contacts, isLoading } = useGetContacts();
  const updateMutation = useUpdateContacts();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initialized = useRef(false);
  const { lang } = useLanguage();

  const urlMsg = t(i18n.validation.urlInvalid, lang);
  const emailMsg = t(i18n.validation.emailInvalid, lang);

  const contactsSchema = useMemo(
    () =>
      z.object({
        labelEn: z.string().optional(),
        labelRu: z.string().optional(),
        labelTj: z.string().optional(),
        headingEn: z.string().optional(),
        headingRu: z.string().optional(),
        headingTj: z.string().optional(),
        subtextEn: z.string().optional(),
        subtextRu: z.string().optional(),
        subtextTj: z.string().optional(),
        address: z.string().optional(),
        addressRu: z.string().optional(),
        addressTj: z.string().optional(),
        workingHoursEn: z.string().optional(),
        workingHoursRu: z.string().optional(),
        workingHoursTj: z.string().optional(),
        email: z.string().email(emailMsg).optional().or(z.literal("")),
        phone: z.string().optional(),
        whatsapp: z.string().url(urlMsg).optional().or(z.literal("")),
        telegram: z.string().url(urlMsg).optional().or(z.literal("")),
        instagram: z.string().url(urlMsg).optional().or(z.literal("")),
        youtube: z.string().url(urlMsg).optional().or(z.literal("")),
        facebook: z.string().url(urlMsg).optional().or(z.literal("")),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang]
  );

  const emptyStr = {
    labelEn: "", labelRu: "", labelTj: "",
    headingEn: "", headingRu: "", headingTj: "",
    subtextEn: "", subtextRu: "", subtextTj: "",
    address: "", addressRu: "", addressTj: "",
    workingHoursEn: "", workingHoursRu: "", workingHoursTj: "",
    email: "", phone: "", whatsapp: "",
    telegram: "", instagram: "", youtube: "", facebook: "",
  };

  const form = useForm<ContactsFormValues>({
    resolver: zodResolver(contactsSchema),
    defaultValues: emptyStr,
  });

  useEffect(() => {
    if (contacts && !initialized.current) {
      form.reset({
        labelEn: contacts.labelEn || "",
        labelRu: contacts.labelRu || "",
        labelTj: contacts.labelTj || "",
        headingEn: contacts.headingEn || "",
        headingRu: contacts.headingRu || "",
        headingTj: contacts.headingTj || "",
        subtextEn: contacts.subtextEn || "",
        subtextRu: contacts.subtextRu || "",
        subtextTj: contacts.subtextTj || "",
        address: contacts.address || "",
        addressRu: contacts.addressRu || "",
        addressTj: contacts.addressTj || "",
        workingHoursEn: contacts.workingHoursEn || "",
        workingHoursRu: contacts.workingHoursRu || "",
        workingHoursTj: contacts.workingHoursTj || "",
        email: contacts.email || "",
        phone: contacts.phone || "",
        whatsapp: contacts.whatsapp || "",
        telegram: contacts.telegram || "",
        instagram: contacts.instagram || "",
        youtube: contacts.youtube || "",
        facebook: contacts.facebook || "",
      });
      initialized.current = true;
    }
  }, [contacts, form]);

  const n = (v: string) => v.trim() === "" ? null : v.trim();

  const onSubmit = (values: ContactsFormValues) => {
    const data = {
      labelEn: n(values.labelEn),
      labelRu: n(values.labelRu),
      labelTj: n(values.labelTj),
      headingEn: n(values.headingEn),
      headingRu: n(values.headingRu),
      headingTj: n(values.headingTj),
      subtextEn: n(values.subtextEn),
      subtextRu: n(values.subtextRu),
      subtextTj: n(values.subtextTj),
      address: n(values.address),
      addressRu: n(values.addressRu),
      addressTj: n(values.addressTj),
      workingHoursEn: n(values.workingHoursEn),
      workingHoursRu: n(values.workingHoursRu),
      workingHoursTj: n(values.workingHoursTj),
      email: n(values.email),
      phone: n(values.phone),
      whatsapp: n(values.whatsapp),
      telegram: n(values.telegram),
      instagram: n(values.instagram),
      youtube: n(values.youtube),
      facebook: n(values.facebook),
    };
    updateMutation.mutate({ data }, {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetContactsQueryKey(), data);
        toast({ title: t(i18n.form.contactsUpdated, lang) });
      },
    });
  };

  if (isLoading) return <div className="text-muted-foreground">{t(i18n.form.loadingContacts, lang)}</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* ── Section Text Content (per-language) ── */}
          <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">{t(i18n.form.sectionContent, lang)}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="en">
                <TabsList className="w-full rounded-none border-b border-border/50 bg-card/60 h-auto p-1 gap-1">
                  <TabsTrigger value="en" className={tabTriggerClass}>{t(i18n.langLabels.english, lang)}</TabsTrigger>
                  <TabsTrigger value="ru" className={tabTriggerClass}>{t(i18n.langLabels.russian, lang)}</TabsTrigger>
                  <TabsTrigger value="tj" className={tabTriggerClass}>{t(i18n.langLabels.tajik, lang)}</TabsTrigger>
                </TabsList>

                {/* ── EN ── */}
                <TabsContent value="en" className="p-4 space-y-4 mt-0">
                  <FormField control={form.control} name="labelEn" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.sectionLabel, lang)} <span className="text-primary text-xs">(EN)</span></FormLabel>
                      <FormControl><Input placeholder={t(i18n.contacts.label, "en")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="headingEn" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.sectionHeading, lang)} <span className="text-primary text-xs">(EN)</span></FormLabel>
                      <FormControl><Input placeholder={t(i18n.contacts.heading, "en")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="subtextEn" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.sectionSubtext, lang)} <span className="text-primary text-xs">(EN)</span></FormLabel>
                      <FormControl><Textarea rows={3} placeholder={t(i18n.contacts.subtext, "en")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.address, lang)} <span className="text-primary text-xs">(EN)</span></FormLabel>
                      <FormControl><Textarea rows={2} placeholder="e.g. 17 Rudaki Ave, Dushanbe, Tajikistan" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="workingHoursEn" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.workingHours, lang)} <span className="text-primary text-xs">(EN)</span></FormLabel>
                      <FormControl><Input placeholder={t(i18n.form.workingHoursPlaceholder, "en")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>

                {/* ── RU ── */}
                <TabsContent value="ru" className="p-4 space-y-4 mt-0">
                  <FormField control={form.control} name="labelRu" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.sectionLabel, lang)} <span className="text-primary text-xs">(RU)</span></FormLabel>
                      <FormControl><Input placeholder={t(i18n.contacts.label, "ru")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="headingRu" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.sectionHeading, lang)} <span className="text-primary text-xs">(RU)</span></FormLabel>
                      <FormControl><Input placeholder={t(i18n.contacts.heading, "ru")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="subtextRu" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.sectionSubtext, lang)} <span className="text-primary text-xs">(RU)</span></FormLabel>
                      <FormControl><Textarea rows={3} placeholder={t(i18n.contacts.subtext, "ru")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="addressRu" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.address, lang)} <span className="text-primary text-xs">(RU)</span></FormLabel>
                      <FormControl><Textarea rows={2} placeholder="напр. пр. Рудаки 17, Душанбе, Таджикистан" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="workingHoursRu" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.workingHours, lang)} <span className="text-primary text-xs">(RU)</span></FormLabel>
                      <FormControl><Input placeholder={t(i18n.form.workingHoursPlaceholder, "ru")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>

                {/* ── TJ ── */}
                <TabsContent value="tj" className="p-4 space-y-4 mt-0">
                  <FormField control={form.control} name="labelTj" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.sectionLabel, lang)} <span className="text-primary text-xs">(TJ)</span></FormLabel>
                      <FormControl><Input placeholder={t(i18n.contacts.label, "tj")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="headingTj" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.sectionHeading, lang)} <span className="text-primary text-xs">(TJ)</span></FormLabel>
                      <FormControl><Input placeholder={t(i18n.contacts.heading, "tj")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="subtextTj" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.sectionSubtext, lang)} <span className="text-primary text-xs">(TJ)</span></FormLabel>
                      <FormControl><Textarea rows={3} placeholder={t(i18n.contacts.subtext, "tj")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="addressTj" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.address, lang)} <span className="text-primary text-xs">(TJ)</span></FormLabel>
                      <FormControl><Textarea rows={2} placeholder="м. кӯчаи Рӯдакӣ 17, Душанбе, Тоҷикистон" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="workingHoursTj" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.workingHours, lang)} <span className="text-primary text-xs">(TJ)</span></FormLabel>
                      <FormControl><Input placeholder={t(i18n.form.workingHoursPlaceholder, "tj")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* ── Contact Details (language-agnostic) ── */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="font-display text-base">{t(i18n.form.contactDetails, lang)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">{t(i18n.form.general, lang)}</h3>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.contacts.email, lang)}</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.contacts.phone, lang)}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="whatsapp" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.whatsappUrl, lang)}</FormLabel>
                      <FormControl><Input placeholder={t(i18n.form.whatsappPlaceholder, lang)} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">{t(i18n.form.socialLinks, lang)}</h3>
                  <FormField control={form.control} name="telegram" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.telegramUrl, lang)}</FormLabel>
                      <FormControl><Input placeholder="https://t.me/yourchannel" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="instagram" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.instagramUrl, lang)}</FormLabel>
                      <FormControl><Input placeholder="https://instagram.com/yourprofile" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="youtube" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.youtubeUrlLabel, lang)}</FormLabel>
                      <FormControl><Input placeholder="https://youtube.com/@yourchannel" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="facebook" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t(i18n.form.facebookUrl, lang)}</FormLabel>
                      <FormControl><Input placeholder="https://facebook.com/yourpage" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? t(i18n.form.saving, lang) : t(i18n.form.saveChanges, lang)}
          </Button>
        </form>
      </Form>
    </div>
  );
}
