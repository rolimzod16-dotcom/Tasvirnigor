import type { Lang } from "@/contexts/language-context";

export function localize(obj: Record<string, unknown>, field: string, lang: Lang): string {
  if (lang === "en") return (obj[field] as string) ?? "";
  const key = lang === "ru" ? `${field}Ru` : `${field}Tj`;
  const localized = obj[key] as string | null | undefined;
  return localized || (obj[field] as string) || "";
}
