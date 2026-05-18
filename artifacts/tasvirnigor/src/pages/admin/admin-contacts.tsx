import { useEffect, useMemo, useRef } from "react";
import { useGetContacts, useUpdateContacts, getGetContactsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";

type ContactsFormValues = {
  email: string;
  phone: string;
  address: string;
  telegram: string;
  instagram: string;
  youtube: string;
  facebook: string;
};

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
        email: z.string().email(emailMsg).optional().or(z.literal("")),
        phone: z.string().optional(),
        address: z.string().optional(),
        telegram: z.string().url(urlMsg).optional().or(z.literal("")),
        instagram: z.string().url(urlMsg).optional().or(z.literal("")),
        youtube: z.string().url(urlMsg).optional().or(z.literal("")),
        facebook: z.string().url(urlMsg).optional().or(z.literal("")),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang]
  );

  const form = useForm<ContactsFormValues>({
    resolver: zodResolver(contactsSchema),
    defaultValues: { email: "", phone: "", address: "", telegram: "", instagram: "", youtube: "", facebook: "" },
  });

  useEffect(() => {
    if (contacts && !initialized.current) {
      form.reset({
        email: contacts.email || "",
        phone: contacts.phone || "",
        address: contacts.address || "",
        telegram: contacts.telegram || "",
        instagram: contacts.instagram || "",
        youtube: contacts.youtube || "",
        facebook: contacts.facebook || "",
      });
      initialized.current = true;
    }
  }, [contacts, form]);

  const onSubmit = (values: ContactsFormValues) => {
    // Convert empty strings to null so the DB stores proper nulls
    // instead of empty strings, which avoids ambiguous falsy behaviour.
    const data = {
      email: values.email || null,
      phone: values.phone || null,
      address: values.address || null,
      telegram: values.telegram || null,
      instagram: values.instagram || null,
      youtube: values.youtube || null,
      facebook: values.facebook || null,
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
    <Card className="border-border/50 bg-card/50 backdrop-blur max-w-3xl">
      <CardHeader>
        <CardTitle className="font-display">{t(i18n.form.contactInfo, lang)}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-lg">{t(i18n.form.general, lang)}</h3>
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
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.form.address, lang)}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg">{t(i18n.form.socialLinks, lang)}</h3>
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

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t(i18n.form.saving, lang) : t(i18n.form.saveChanges, lang)}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
