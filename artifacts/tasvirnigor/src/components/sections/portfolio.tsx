import { useListProjects } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Play, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { localize } from "@/lib/localize";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

export function Portfolio() {
  const { data: projects, isLoading } = useListProjects();
  const { lang } = useLanguage();

  if (isLoading) {
    return (
      <section id="portfolio" className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!projects || projects.length === 0) return null;

  const [featured, ...rest] = projects;

  return (
    <section id="portfolio" className="py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
              {t(i18n.portfolio.label, lang)}
            </p>
            <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
              {t(i18n.portfolio.heading, lang)}
            </h3>
          </div>
          <p className="text-muted-foreground font-light max-w-sm md:text-right text-sm leading-relaxed">
            {t(i18n.portfolio.clickHint, lang)}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-6"
        >
          {/* Featured large card */}
          {featured && (
            <motion.a
              variants={item}
              href={featured.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`card-project-${featured.id}`}
              className="group block relative rounded-2xl overflow-hidden bg-card border border-border/40 hover:border-primary/60 transition-all duration-300"
            >
              <div className="aspect-[21/9] md:aspect-[3/1] relative overflow-hidden">
                <img
                  src={featured.bannerUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/90 backdrop-blur flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                    <Play className="w-8 h-8 ml-1 text-primary-foreground" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-primary text-xs font-medium tracking-widest uppercase mb-2">
                        {t(i18n.portfolio.featured, lang)}
                      </p>
                      <h4 className="font-display font-bold text-2xl md:text-4xl text-foreground group-hover:text-primary transition-colors">
                        {localize(featured as unknown as Record<string, unknown>, "title", lang)}
                      </h4>
                      {(localize(featured as unknown as Record<string, unknown>, "description", lang)) && (
                        <p className="text-muted-foreground font-light mt-2 max-w-xl line-clamp-2 text-sm md:text-base">
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

          {/* Remaining grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((project) => (
                <motion.a
                  key={project.id}
                  variants={item}
                  href={project.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`card-project-${project.id}`}
                  className="group block relative rounded-xl overflow-hidden bg-card border border-border/40 hover:border-primary/60 transition-all duration-300"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={project.bannerUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-xl">
                        <Play className="w-5 h-5 ml-0.5 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-display font-bold text-lg mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                      {localize(project as unknown as Record<string, unknown>, "title", lang)}
                    </h4>
                    {localize(project as unknown as Record<string, unknown>, "description", lang) && (
                      <p className="text-muted-foreground font-light text-sm line-clamp-2 leading-relaxed">
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
