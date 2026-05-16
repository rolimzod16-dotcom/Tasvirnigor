import { Link } from "wouter";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Lock } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { lang } = useLanguage();

  const NAV_LINKS = [
    { href: "#hero", label: t(i18n.nav.home, lang) },
    { href: "#about", label: t(i18n.nav.about, lang) },
    { href: "#services", label: t(i18n.nav.services, lang) },
    { href: "#portfolio", label: t(i18n.nav.portfolio, lang) },
    { href: "#team", label: t(i18n.nav.team, lang) },
    { href: "#contacts", label: t(i18n.nav.contacts, lang) },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileOpen(false);
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border/50 py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="font-display font-bold text-2xl tracking-tighter text-primary shrink-0">
            TASVIRNIGOR
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors tracking-wide"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <LanguageSwitcher />
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-border/60 text-muted-foreground hover:text-primary hover:border-primary/60 text-xs"
              >
                <Lock className="w-3 h-3" />
                {t(i18n.nav.adminLogin, lang)}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary hover:bg-primary/20"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Nav */}
        {isMobileOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border/50 py-4 px-4 flex flex-col gap-4 shadow-xl">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <LanguageSwitcher />
              <Link href="/admin" onClick={() => setIsMobileOpen(false)}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Lock className="w-3 h-3" />
                  {t(i18n.nav.adminLogin, lang)}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
