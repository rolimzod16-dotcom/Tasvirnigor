import { useGetAbout } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { localize } from "@/lib/localize";

export function About() {
  const { data: about, isLoading } = useGetAbout();
  const { lang } = useLanguage();

  if (isLoading) {
    return (
      <section id="about" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="h-64 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (!about) return null;

  const headline = localize(about as unknown as Record<string, unknown>, "headline", lang);
  const body = localize(about as unknown as Record<string, unknown>, "body", lang);
  const mission = localize(about as unknown as Record<string, unknown>, "mission", lang);

  return (
    <section id="about" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start mb-20">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75 }}
          >
            <p className="section-label">{t(i18n.about.label, lang)}</p>
            <h2 className="section-heading text-[#141414] mb-6">
              {headline}
            </h2>
            {about.founded && (
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#f5f3ef] border border-[#e8e4dc] mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <p className="text-sm text-[#666] font-medium">
                  {t(i18n.about.estLabel, lang)} {about.founded} · {t(i18n.about.location, lang)}
                </p>
              </div>
            )}
          </motion.div>

          <motion.div
            className="lg:col-span-7 space-y-6"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, delay: 0.15 }}
          >
            <p className="text-[#555] text-base md:text-lg font-light leading-relaxed whitespace-pre-wrap">
              {body}
            </p>

            {mission && (
              <div className="relative pl-5 border-l-2 border-primary mt-6">
                <p className="text-[#333] font-medium text-base italic leading-relaxed">
                  &ldquo;{mission}&rdquo;
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {i18n.about.stats.map((stat) => (
            <div
              key={stat.value}
              className="bg-[#f8f7f5] border border-[#ebebeb] rounded-2xl px-6 py-8 text-center hover:border-primary/30 hover:bg-[#fdf9f2] transition-all duration-300"
            >
              <p className="text-4xl md:text-5xl font-display font-extrabold text-primary mb-2 leading-none">
                {stat.value}
              </p>
              <p className="text-[#888] text-xs uppercase tracking-wider font-semibold mt-1">
                {t(stat.label, lang)}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
