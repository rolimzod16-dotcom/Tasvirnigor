import { useLanguage, type Lang } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

const LANGS: Lang[] = ["en", "ru", "tj"];

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={cn("flex items-center gap-0.5 bg-card/40 border border-border/40 rounded-lg p-0.5", className)}>
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-md transition-all duration-150",
            lang === l
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
