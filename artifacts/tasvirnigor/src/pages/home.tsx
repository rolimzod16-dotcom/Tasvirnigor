import { Link } from "wouter";
import { Lock } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Services } from "@/components/sections/services";
import { Portfolio } from "@/components/sections/portfolio";
import { Team } from "@/components/sections/team";
import { Contacts } from "@/components/sections/contacts";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";

export default function Home() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Team />
        <Contacts />
      </main>
      <footer className="py-8 bg-card border-t border-border/50">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm font-light">
            © {new Date().getFullYear()} Tasvirnigor Film &amp; Animation Studio. {t(i18n.footer.rights, lang)}
          </p>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            <Lock className="w-3 h-3" />
            {t(i18n.footer.adminLogin, lang)}
          </Link>
        </div>
      </footer>
    </div>
  );
}
