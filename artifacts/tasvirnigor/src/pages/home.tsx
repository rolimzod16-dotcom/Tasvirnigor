import { Link } from "wouter";
import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Services } from "@/components/sections/services";
import { Portfolio } from "@/components/sections/portfolio";
import { Team } from "@/components/sections/team";
import { Partners } from "@/components/sections/partners";
import { Contacts } from "@/components/sections/contacts";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";

export default function Home() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-white text-foreground">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Team />
        <Partners />
        <Contacts />
      </main>

      <footer className="bg-[#0f0f0f] text-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-14">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <p className="font-display font-extrabold text-xl tracking-tight text-white mb-2">
                TASVIRNIGOR<span className="text-primary">.</span>
              </p>
              <p className="text-white/40 text-sm font-light">
                Film &amp; Animation Studio — Dushanbe, Tajikistan
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
              <p className="text-white/35 text-sm">
                © {new Date().getFullYear()} Tasvirnigor. {t(i18n.footer.rights, lang)}
              </p>
              <Link
                href="/admin"
                className="text-white/30 hover:text-white/60 text-xs transition-colors tracking-wide font-medium uppercase"
              >
                {t(i18n.footer.adminLogin, lang)}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
