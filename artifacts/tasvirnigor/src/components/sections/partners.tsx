import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useListPartners } from "@workspace/api-client-react";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import type { Partner } from "@workspace/api-client-react";

function PartnerCard({ partner, index }: { partner: Partner; index: number }) {
  const { lang } = useLanguage();
  const description =
    lang === "ru" ? partner.descriptionRu || partner.description
    : lang === "tj" ? partner.descriptionTj || partner.description
    : partner.description;

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col items-center gap-5 rounded-2xl border border-[#ebebeb] bg-white p-7 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(196,145,10,0.12)] hover:-translate-y-1 cursor-pointer"
    >
      <div className="relative w-full flex items-center justify-center h-20">
        <img
          src={partner.logoUrl}
          alt={partner.name}
          className="max-h-16 max-w-[160px] w-auto h-auto object-contain transition-all duration-300 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100"
        />
      </div>

      <div className="text-center space-y-1.5 flex-1">
        <p className="font-display font-semibold text-sm text-[#141414] tracking-tight leading-tight">
          {partner.name}
        </p>
        {description && (
          <p className="text-xs text-[#888] leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {partner.websiteUrl && (
        <div className="flex items-center gap-1 text-[10px] font-semibold text-primary/60 group-hover:text-primary transition-colors uppercase tracking-widest">
          <ExternalLink className="w-3 h-3" />
          <span>Visit</span>
        </div>
      )}

      <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/0 group-hover:ring-primary/20 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );

  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${partner.name}`}
      >
        {card}
      </a>
    );
  }

  return card;
}

export function Partners() {
  const { data: partners = [], isLoading } = useListPartners();
  const { lang } = useLanguage();

  if (!isLoading && partners.length === 0) return null;

  return (
    <section id="partners" className="py-24 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-label">
            {t(i18n.partners.label, lang)}
          </p>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[#141414] tracking-tight">
            {t(i18n.partners.heading, lang)}
          </h2>
          <div className="w-12 h-0.5 bg-primary mt-4" />
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#ebebeb] bg-white p-7 h-[160px] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {partners.map((partner, i) => (
              <PartnerCard key={partner.id} partner={partner} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
