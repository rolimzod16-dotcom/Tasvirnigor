import { useGetAbout } from "@workspace/api-client-react";
import { motion } from "framer-motion";

const STATS = [
  { value: "10+", label: "Years of craft" },
  { value: "40+", label: "Productions" },
  { value: "15+", label: "Awards" },
  { value: "20+", label: "Countries screened" },
];

export function About() {
  const { data: about, isLoading } = useGetAbout();

  if (isLoading) {
    return (
      <section id="about" className="py-32 bg-background min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </section>
    );
  }

  if (!about) return null;

  return (
    <section id="about" className="py-32 bg-background relative border-t border-border/30">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-24">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">About the Studio</p>
            <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tight leading-tight text-foreground">
              {about.headline}
            </h3>
            {about.founded && (
              <div className="mt-8 flex items-center gap-3">
                <div className="w-8 h-px bg-primary" />
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                  Est. {about.founded} · Dushanbe, Tajikistan
                </p>
              </div>
            )}
          </motion.div>

          <motion.div
            className="lg:col-span-7 space-y-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-lg text-muted-foreground font-light leading-relaxed whitespace-pre-wrap">
              {about.body}
            </p>

            {about.mission && (
              <div className="relative pl-6 mt-8">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                <p className="text-foreground/80 font-light text-base italic leading-relaxed">
                  &ldquo;{about.mission}&rdquo;
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/30 rounded-2xl overflow-hidden border border-border/30"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-card/60 px-8 py-10 text-center">
              <p className="text-4xl md:text-5xl font-display font-bold text-primary mb-2">{stat.value}</p>
              <p className="text-muted-foreground text-sm uppercase tracking-wider font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
