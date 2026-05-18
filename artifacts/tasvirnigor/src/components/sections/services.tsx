import { motion } from "framer-motion";
import { Film, Video, MonitorPlay, Clapperboard, MonitorSmartphone, Palette } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";

const ICONS = [Film, Palette, MonitorPlay, MonitorSmartphone, Video, Clapperboard];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

export function Services() {
  const { lang } = useLanguage();

  return (
    <section id="services" className="py-24 md:py-32 bg-[#f8f7f5]">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mb-16"
        >
          <p className="section-label">{t(i18n.services.label, lang)}</p>
          <h2 className="section-heading text-[#141414]">
            {t(i18n.services.heading, lang)}
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {i18n.services.items.map((service, index) => {
            const Icon = ICONS[index];
            return (
              <motion.div
                key={index}
                variants={item}
                className="group bg-white rounded-2xl p-7 border border-[#ebebeb] hover:border-primary/25 hover:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.10)] transition-all duration-300"
              >
                <div className="w-11 h-11 bg-[#fdf5e4] rounded-xl flex items-center justify-center mb-5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#141414] mb-3">
                  {t(service.title, lang)}
                </h3>
                <p className="text-[#666] font-light text-sm leading-relaxed">
                  {t(service.description, lang)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
