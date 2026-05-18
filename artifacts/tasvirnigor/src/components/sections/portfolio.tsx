import { useListProjects } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Play, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { localize } from "@/lib/localize";
import { ensureProtocol } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function Portfolio() {
  const { data: projects, isLoading } = useListProjects();
  const { lang } = useLanguage();

  if (isLoading) {
    return (
      <section id="portfolio" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-2xl bg-[#f0f0f0] animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!projects || projects.length === 0) return null;

  const [featured, ...rest] = projects;

  return (
    <section id="portfolio" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12"
        >
          <div>
            <p className="section-label">{t(i18n.portfolio.label, lang)}</p>
            <h2 className="section-heading text-[#141414]">
              {t(i18n.portfolio.heading, lang)}
            </h2>
          </div>
          <p className="text-[#888] text-sm md:text-right max-w-xs leading-relaxed font-light">
            {t(i18n.portfolio.clickHint, lang)}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-5"
        >
          {featured && (
            <motion.a
              variants={item}
              href={ensureProtocol(featured.youtubeUrl) ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`card-project-${featured.id}`}
              className="group block relative rounded-2xl overflow-hidden border border-[#e8e8e8] hover:border-primary/30 hover:shadow-[0_16px_64px_-16px_rgba(0,0,0,0.14)] transition-all duration-400"
            >
              <div className="aspect-[21/9] md:aspect-[3/1] relative overflow-hidden bg-[#0c0c0c]">
                <img
                  src={featured.bannerUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03] opacity-90"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                    <Play className="w-6 h-6 ml-0.5 text-white" fill="white" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest mb-3">
                        {t(i18n.portfolio.featured, lang)}
                      </span>
                      <h3 className="font-display font-bold text-2xl md:text-4xl text-white group-hover:text-primary transition-colors duration-200 leading-tight">
                        {localize(featured as unknown as Record<string, unknown>, "title", lang)}
                      </h3>
                      {localize(featured as unknown as Record<string, unknown>, "description", lang) && (
                        <p className="text-white/65 font-light mt-2 max-w-2xl line-clamp-2 text-sm md:text-base">
                          {localize(featured as unknown as Record<string, unknown>, "description", lang)}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mb-1" />
                  </div>
                </div>
              </div>
            </motion.a>
          )}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((project) => (
                <motion.a
                  key={project.id}
                  variants={item}
                  href={ensureProtocol(project.youtubeUrl) ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`card-project-${project.id}`}
                  className="group block rounded-2xl overflow-hidden border border-[#e8e8e8] hover:border-primary/30 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] transition-all duration-300 bg-white"
                >
                  <div className="aspect-video relative overflow-hidden bg-[#0c0c0c]">
                    <img
                      src={project.bannerUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.05] opacity-90"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-xl">
                        <Play className="w-4 h-4 ml-0.5 text-white" fill="white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-display font-bold text-[#141414] text-base mb-1.5 group-hover:text-primary transition-colors duration-200 line-clamp-1">
                      {localize(project as unknown as Record<string, unknown>, "title", lang)}
                    </h4>
                    {localize(project as unknown as Record<string, unknown>, "description", lang) && (
                      <p className="text-[#888] text-sm line-clamp-2 leading-relaxed font-light">
                        {localize(project as unknown as Record<string, unknown>, "description", lang)}
                      </p>
                    )}
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
