import { motion } from "framer-motion";
import { Film, Video, MonitorPlay, Clapperboard, MonitorSmartphone, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";

const ICONS = [Film, Palette, MonitorPlay, MonitorSmartphone, Video, Clapperboard];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

export function Services() {
  const { lang } = useLanguage();

  return (
    <section id="services" className="py-32 bg-secondary/30 relative">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
            {t(i18n.services.label, lang)}
          </h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            {t(i18n.services.heading, lang)}
          </h3>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {i18n.services.items.map((service, index) => {
            const Icon = ICONS[index];
            return (
              <motion.div key={index} variants={item}>
                <Card className="bg-card border-border/50 hover:border-primary/50 transition-colors h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="font-display text-xl">{t(service.title, lang)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      {t(service.description, lang)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
