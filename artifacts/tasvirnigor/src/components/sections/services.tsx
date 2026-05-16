import { motion } from "framer-motion";
import { Film, Video, MonitorPlay, Clapperboard, MonitorSmartphone, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SERVICES = [
  {
    title: "Film Production",
    description: "Full-scale cinematic production for feature films and shorts, utilizing state-of-the-art equipment and world-class crew.",
    icon: Film,
  },
  {
    title: "Animation",
    description: "2D and 3D animation services bringing imaginative worlds and characters to life with meticulous detail.",
    icon: Palette,
  },
  {
    title: "Post-Production",
    description: "Expert editing, color grading, sound design, and VFX to refine and perfect your visual narrative.",
    icon: MonitorPlay,
  },
  {
    title: "Commercial Advertising",
    description: "High-impact commercial video production designed to elevate brands and captivate audiences.",
    icon: MonitorSmartphone,
  },
  {
    title: "Documentaries",
    description: "Compelling documentary filmmaking that captures truth, emotion, and the essence of the human experience.",
    icon: Video,
  },
  {
    title: "Motion Graphics",
    description: "Dynamic visual designs and typography that communicate complex ideas with clarity and style.",
    icon: Clapperboard,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export function Services() {
  return (
    <section id="services" className="py-32 bg-secondary/30 relative">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-primary font-medium tracking-widest uppercase text-sm mb-4">Expertise</h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            Our Services
          </h3>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {SERVICES.map((service, index) => (
            <motion.div key={index} variants={item}>
              <Card className="bg-card border-border/50 hover:border-primary/50 transition-colors h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                    <service.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="font-display text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-light leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
