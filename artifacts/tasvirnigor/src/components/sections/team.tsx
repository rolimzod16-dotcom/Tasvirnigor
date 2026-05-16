import { useListTeamMembers } from "@workspace/api-client-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export function Team() {
  const { data: teamMembers, isLoading } = useListTeamMembers();

  if (isLoading) return null;
  if (!teamMembers || teamMembers.length === 0) return null;

  return (
    <section id="team" className="py-32 bg-secondary/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-primary font-medium tracking-widest uppercase text-sm mb-4">The Creators</h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            Our Team
          </h3>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {teamMembers.map((member) => (
            <motion.div key={member.id} variants={item} className="group text-center">
              <div className="aspect-[3/4] relative rounded-lg overflow-hidden mb-6 border border-border/50">
                <img 
                  src={member.photoUrl} 
                  alt={member.name}
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h4 className="font-display font-bold text-xl mb-1">{member.name}</h4>
              <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
                {member.position}
              </p>
              {member.bio && (
                <p className="text-muted-foreground font-light text-sm line-clamp-3 px-4">
                  {member.bio}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
