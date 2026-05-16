import { useGetAbout } from "@workspace/api-client-react";
import { motion } from "framer-motion";

export function About() {
  const { data: about, isLoading } = useGetAbout();

  if (isLoading) {
    return (
      <section id="about" className="py-24 bg-background min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </section>
    );
  }

  if (!about) return null;

  return (
    <section id="about" className="py-32 bg-background relative border-t border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <motion.div 
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-primary font-medium tracking-widest uppercase text-sm mb-4">About the Studio</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tight leading-tight text-foreground">
              {about.headline}
            </h3>
            {about.founded && (
              <div className="mt-8 border-l-2 border-primary pl-4">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Est. {about.founded}</p>
                <p className="text-foreground font-display font-bold mt-1">Dushanbe, Tajikistan</p>
              </div>
            )}
          </motion.div>
          
          <motion.div 
            className="lg:col-span-7 space-y-8 text-lg text-muted-foreground font-light leading-relaxed"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="whitespace-pre-wrap">{about.body}</div>
            
            {about.mission && (
              <div className="p-8 bg-card/30 border border-border/50 rounded-lg mt-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <h4 className="text-foreground font-display font-bold text-xl mb-4">Our Mission</h4>
                <p className="text-base italic">&quot;{about.mission}&quot;</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
