import { useListProjects } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

export function Portfolio() {
  const { data: projects, isLoading } = useListProjects();

  if (isLoading) {
    return (
      <section id="portfolio" className="py-32 bg-background">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="animate-pulse w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </section>
    );
  }

  if (!projects || projects.length === 0) return null;

  return (
    <section id="portfolio" className="py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-primary font-medium tracking-widest uppercase text-sm mb-4">Selected Work</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
              Portfolio
            </h3>
          </div>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {projects.map((project) => (
            <motion.a
              key={project.id}
              variants={item}
              href={project.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-colors"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={project.bannerUrl} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 backdrop-blur">
                    <Play className="w-6 h-6 ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-display font-bold text-2xl mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h4>
                {project.description && (
                  <p className="text-muted-foreground font-light line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
