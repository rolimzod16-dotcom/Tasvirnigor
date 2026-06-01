import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { useListServices } from "@workspace/api-client-react";
import { ServiceCard } from "@/components/sections/services";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export default function ServicesPage() {
  const { lang } = useLanguage();
  const { data: dbServices, isLoading } = useListServices();

  const services = useMemo(
    () =>
      [...(dbServices ?? [])]
        .filter((s) => s.isActive !== false)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [dbServices]
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#4F8FA8] via-[#3F7388] to-[#2F5F73] pt-16">
      {/* Header band */}
      <div className="bg-gradient-to-r from-[#1E4A5E] to-[#0E2A38] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <Link href="/">
            <motion.span
              whileHover={{ x: -3 }}
              className="inline-flex items-center gap-2 text-white/50 hover:text-white
                         text-sm font-medium cursor-pointer transition-colors duration-200 mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              {t(i18n.servicesPage.backToHome, lang)}
            </motion.span>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-primary text-xs font-bold uppercase tracking-[0.16em] mb-3">
              {t(i18n.servicesPage.label, lang)}
            </p>
            <h1 className="font-display font-black text-white text-4xl md:text-6xl lg:text-7xl leading-[0.95]">
              {t(i18n.servicesPage.heading, lang)}
            </h1>
          </motion.div>
        </div>
      </div>
      {/* Cards */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-16 md:py-24">
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden animate-pulse">
                <div className="flex flex-col lg:flex-row lg:min-h-[280px]">
                  <div className="flex-1 p-9 space-y-4">
                    <div className="h-14 w-16 bg-[#f0ede8] rounded-lg" />
                    <div className="h-6 bg-[#eee] rounded w-2/3" />
                    <div className="h-4 bg-[#eee] rounded w-full" />
                  </div>
                  <div className="aspect-[4/3] lg:aspect-auto lg:w-[46%] bg-[#e8e8e8]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && services.length === 0 && (
          <div className="text-center py-16 text-[#bbb] text-sm">
            {lang === "ru" ? "Услуги скоро появятся." : lang === "tj" ? "Хидматҳо ба зудӣ." : "Services coming soon."}
          </div>
        )}

        {!isLoading && services.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {services.map((service, idx) => (
              <ServiceCard key={service.id} service={service} index={idx} lang={lang} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
