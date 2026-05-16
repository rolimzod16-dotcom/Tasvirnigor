import { useEffect, useRef } from "react";
import { useGetAbout, useUpdateAbout, getGetAboutQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const aboutSchema = z.object({
  headline: z.string().min(1, "Headline is required"),
  body: z.string().min(1, "Body is required"),
  mission: z.string().optional(),
  founded: z.string().optional(),
});

type AboutFormValues = z.infer<typeof aboutSchema>;

export function AdminAbout() {
  const { data: about, isLoading } = useGetAbout();
  const updateMutation = useUpdateAbout();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  const form = useForm<AboutFormValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      headline: "",
      body: "",
      mission: "",
      founded: "",
    },
  });

  useEffect(() => {
    if (about && !initialized.current) {
      form.reset({
        headline: about.headline,
        body: about.body,
        mission: about.mission || "",
        founded: about.founded || "",
      });
      initialized.current = true;
    }
  }, [about, form]);

  const onSubmit = (values: AboutFormValues) => {
    updateMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetAboutQueryKey(), data);
          toast({ title: "About section updated successfully" });
        },
      }
    );
  };

  if (isLoading) return <div>Loading about section...</div>;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur max-w-3xl">
      <CardHeader>
        <CardTitle className="font-display">About Section</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Text</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[150px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mission Statement</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="founded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Founded Year</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 2010" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
