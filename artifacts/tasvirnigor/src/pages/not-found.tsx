import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function NotFound() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      <div className="text-center max-w-md">
        <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">Tasvirnigor</p>
        <h1 className="font-display font-bold text-6xl text-foreground mb-4">404</h1>
        <div className="w-16 h-px bg-primary mx-auto mb-6" />
        <p className="text-xl font-light text-muted-foreground mb-8">{t(i18n.notFound.description, lang)}</p>
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium tracking-wide uppercase">
          {lang === "ru" ? "← На главную" : lang === "tj" ? "← Ба асосӣ" : "← Back to Home"}
        </Link>
      </div>
    </div>
  );
}
