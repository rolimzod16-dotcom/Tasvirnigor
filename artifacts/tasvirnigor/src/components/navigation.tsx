import { Link } from "wouter";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { lang } = useLanguage();

  const NAV_LINKS = [
    { href: "#about", label: t(i18n.nav.about, lang) },
    { href: "#services", label: t(i18n.nav.services, lang) },
    { href: "#portfolio", label: t(i18n.nav.portfolio, lang) },
    { href: "#team", label: t(i18n.nav.team, lang) },
    { href: "#partners", label: t(i18n.partners.nav, lang) },
    { href: "#contacts", label: t(i18n.nav.contacts, lang) },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileOpen(false);
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-400 ease-in-out",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#ececec] py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className={cn(
              "font-display font-extrabold text-xl tracking-tight shrink-0 transition-colors duration-300",
              isScrolled ? "text-[#141414]" : "text-white"
            )}
          >
            TASVIRNIGOR
            <span className="text-primary">.</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className={cn(
                  "text-sm font-medium transition-colors duration-200 hover:text-primary",
                  isScrolled ? "text-[#444]" : "text-white/85"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <LanguageSwitcher />
            <Link href="/admin">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer",
                  isScrolled
                    ? "border-primary text-primary hover:bg-primary hover:text-white"
                    : "border-white/50 text-white/80 hover:border-white hover:text-white"
                )}
              >
                {t(i18n.nav.adminLogin, lang)}
              </span>
            </Link>
          </div>

          <button
            className={cn(
              "md:hidden p-2 rounded-lg transition-colors",
              isScrolled ? "text-[#141414] hover:bg-gray-100" : "text-white hover:bg-white/10"
            )}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMobileOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#ececec] shadow-lg py-5 px-5 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="text-base font-medium text-[#333] hover:text-primary transition-colors py-2.5 border-b border-[#f0f0f0] last:border-0"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center justify-between pt-4 mt-1">
              <LanguageSwitcher />
              <Link href="/admin" onClick={() => setIsMobileOpen(false)}>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold border border-primary text-primary hover:bg-primary hover:text-white transition-all cursor-pointer">
                  {t(i18n.nav.adminLogin, lang)}
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
