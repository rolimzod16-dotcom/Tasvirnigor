import { useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { lang } = useLanguage();
  const loginMutation = useAdminLogin();

  const loginSchema = useMemo(
    () => z.object({ password: z.string().min(1, t(i18n.validation.passwordRequired, lang)) }),
    [lang]
  );

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data: { password: values.password } }, {
      onSuccess: () => {
        toast({ title: t(i18n.login.successTitle, lang) });
        setLocation("/admin/dashboard");
      },
      onError: () => {
        toast({
          title: t(i18n.login.failedTitle, lang),
          description: t(i18n.login.invalidPassword, lang),
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">{t(i18n.login.title, lang)}</CardTitle>
          <CardDescription>{t(i18n.login.description, lang)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.login.passwordLabel, lang)}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending
                  ? t(i18n.login.authenticating, lang)
                  : t(i18n.login.loginBtn, lang)}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
