import { Link, useLocation } from "wouter";
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
  const [location] = useLocation();

  const isHome = location === "/";
  // On non-home pages always show the solid white nav (no transparent hero behind it)
  const effectiveScrolled = !isHome || isScrolled;

  const NAV_LINKS = [
    { id: "about",    label: t(i18n.nav.about, lang),      homeHref: "#about",    pageHref: "/#about" },
    { id: "services", label: t(i18n.nav.services, lang),   homeHref: "#services", pageHref: "/services" },
    { id: "portfolio",label: t(i18n.nav.portfolio, lang),  homeHref: "#portfolio",pageHref: "/portfolio" },
    { id: "comics",   label: t(i18n.nav.comics, lang),     homeHref: "#comics",   pageHref: "/#comics" },
    { id: "team",     label: t(i18n.nav.team, lang),       homeHref: "#team",     pageHref: "/#team" },
    { id: "partners", label: t(i18n.partners.nav, lang),   homeHref: "#partners", pageHref: "/#partners" },
    { id: "contacts", label: t(i18n.nav.contacts, lang),   homeHref: "#contacts", pageHref: "/#contacts" },
  ] as const;

  function isActive(id: string): boolean {
    if (id === "services")  return location === "/services";
    if (id === "portfolio") return location === "/portfolio";
    if (id === "comics")    return location.startsWith("/comics/");
    return false;
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsMobileOpen(false); }, [location]);

  function handleNav(
    e: React.MouseEvent<HTMLAnchorElement>,
    homeHref: string,
    pageHref: string,
  ) {
    setIsMobileOpen(false);
    // On homepage: smooth-scroll to hash sections
    if (isHome && homeHref.startsWith("#")) {
      e.preventDefault();
      document.querySelector(homeHref)?.scrollIntoView({ behavior: "smooth" });
    }
    // For /services and /portfolio hrefs: let normal link navigation happen
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        effectiveScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#ececec] py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "font-display font-extrabold text-xl tracking-tight shrink-0 transition-colors duration-300",
              effectiveScrolled ? "text-[#141414]" : "text-white"
            )}
          >
            TASVIRNIGOR
            <span className="text-primary">.</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => {
              const href = isHome ? link.homeHref : link.pageHref;
              const active = isActive(link.id);
              return (
                <a
                  key={link.id}
                  href={href}
                  onClick={(e) => handleNav(e, link.homeHref, link.pageHref)}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    active
                      ? "text-primary font-semibold"
                      : effectiveScrolled
                        ? "text-[#444] hover:text-primary"
                        : "text-white/85 hover:text-white"
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="block mt-0.5 h-[2px] rounded-full bg-primary" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <LanguageSwitcher />
            <Link href="/admin">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer",
                  effectiveScrolled
                    ? "border-primary text-primary hover:bg-primary hover:text-white hover:shadow-[0_0_18px_rgba(250,176,55,0.30)]"
                    : "border-white/50 text-white/80 hover:border-[#FAB037]/60 hover:text-white hover:shadow-[0_0_18px_rgba(250,176,55,0.22)]"
                )}
              >
                {t(i18n.nav.adminLogin, lang)}
              </span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={cn(
              "md:hidden p-2 rounded-lg transition-colors",
              effectiveScrolled ? "text-[#141414] hover:bg-gray-100" : "text-white hover:bg-white/10"
            )}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {isMobileOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#ececec] shadow-lg py-5 px-5 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const href = isHome ? link.homeHref : link.pageHref;
              const active = isActive(link.id);
              return (
                <a
                  key={link.id}
                  href={href}
                  onClick={(e) => handleNav(e, link.homeHref, link.pageHref)}
                  className={cn(
                    "text-base font-medium transition-colors py-2.5 border-b border-[#f0f0f0] last:border-0",
                    active ? "text-primary font-semibold" : "text-[#333] hover:text-primary"
                  )}
                >
                  {link.label}
                </a>
              );
            })}
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
