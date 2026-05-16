import { useEffect, useRef } from "react";
import { useGetAbout, useUpdateAbout, getGetAboutQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";

const aboutSchema = z.object({
  headline: z.string().min(1, "Headline (EN) is required"),
  headlineRu: z.string().optional().nullable(),
  headlineTj: z.string().optional().nullable(),
  body: z.string().min(1, "Body (EN) is required"),
  bodyRu: z.string().optional().nullable(),
  bodyTj: z.string().optional().nullable(),
  mission: z.string().optional().nullable(),
  missionRu: z.string().optional().nullable(),
  missionTj: z.string().optional().nullable(),
  founded: z.string().optional().nullable(),
});

type AboutFormValues = z.infer<typeof aboutSchema>;

export function AdminAbout() {
  const { data: about, isLoading } = useGetAbout();
  const updateMutation = useUpdateAbout();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initialized = useRef(false);
  const { lang } = useLanguage();

  const form = useForm<AboutFormValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      headline: "", headlineRu: "", headlineTj: "",
      body: "", bodyRu: "", bodyTj: "",
      mission: "", missionRu: "", missionTj: "",
      founded: "",
    },
  });

  useEffect(() => {
    if (about && !initialized.current) {
      form.reset({
        headline: about.headline,
        headlineRu: about.headlineRu ?? "",
        headlineTj: about.headlineTj ?? "",
        body: about.body,
        bodyRu: about.bodyRu ?? "",
        bodyTj: about.bodyTj ?? "",
        mission: about.mission ?? "",
        missionRu: about.missionRu ?? "",
        missionTj: about.missionTj ?? "",
        founded: about.founded ?? "",
      });
      initialized.current = true;
    }
  }, [about, form]);

  const onSubmit = (values: AboutFormValues) => {
    const data = {
      ...values,
      headlineRu: values.headlineRu || null,
      headlineTj: values.headlineTj || null,
      bodyRu: values.bodyRu || null,
      bodyTj: values.bodyTj || null,
      mission: values.mission || null,
      missionRu: values.missionRu || null,
      missionTj: values.missionTj || null,
      founded: values.founded || null,
    };
    updateMutation.mutate({ data }, {
      onSuccess: (updated) => {
        queryClient.setQueryData(getGetAboutQueryKey(), updated);
        toast({ title: "About section updated successfully" });
      },
    });
  };

  if (isLoading) return <div className="text-muted-foreground">Loading about section...</div>;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur max-w-3xl">
      <CardHeader>
        <CardTitle className="font-display">{t(i18n.admin.about, lang)}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Multilingual tabs */}
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
                  <TabsContent value="en" className="mt-0 space-y-4">
                    <FormField control={form.control} name="headline" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headline <span className="text-primary text-xs">(EN)</span></FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="body" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Text <span className="text-primary text-xs">(EN)</span></FormLabel>
                        <FormControl><Textarea {...field} className="min-h-[150px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="mission" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission Statement <span className="text-primary text-xs">(EN)</span></FormLabel>
                        <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[80px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </TabsContent>
                  <TabsContent value="ru" className="mt-0 space-y-4">
                    <FormField control={form.control} name="headlineRu" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headline <span className="text-primary text-xs">(RU)</span></FormLabel>
                        <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="bodyRu" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Text <span className="text-primary text-xs">(RU)</span></FormLabel>
                        <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[150px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="missionRu" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission Statement <span className="text-primary text-xs">(RU)</span></FormLabel>
                        <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[80px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </TabsContent>
                  <TabsContent value="tj" className="mt-0 space-y-4">
                    <FormField control={form.control} name="headlineTj" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headline <span className="text-primary text-xs">(TJ)</span></FormLabel>
                        <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="bodyTj" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Text <span className="text-primary text-xs">(TJ)</span></FormLabel>
                        <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[150px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="missionTj" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission Statement <span className="text-primary text-xs">(TJ)</span></FormLabel>
                        <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[80px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            <FormField control={form.control} name="founded" render={({ field }) => (
              <FormItem>
                <FormLabel>Founded Year</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="e.g. 2010" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
