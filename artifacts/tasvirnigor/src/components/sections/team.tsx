import { useListTeamMembers } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { localize } from "@/lib/localize";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } }
};

export function Team() {
  const { data: teamMembers, isLoading } = useListTeamMembers();
  const { lang } = useLanguage();

  if (isLoading) {
    return (
      <section id="team" className="py-32 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!teamMembers || teamMembers.length === 0) return null;

  return (
    <section id="team" className="py-32 bg-card/20 border-t border-border/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
            {t(i18n.team.label, lang)}
          </p>
          <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            {t(i18n.team.heading, lang)}
          </h3>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {teamMembers.map((member) => {
            const position = localize(member as unknown as Record<string, unknown>, "position", lang);
            const bio = localize(member as unknown as Record<string, unknown>, "bio", lang);

            return (
              <motion.div
                key={member.id}
                variants={item}
                data-testid={`card-team-${member.id}`}
                className="group"
              >
                <div className="aspect-[3/4] relative rounded-xl overflow-hidden mb-4 border border-border/30 group-hover:border-primary/40 transition-colors duration-300">
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-full h-full object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  {bio && (
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-foreground/80 text-xs leading-relaxed line-clamp-4">
                        {bio}
                      </p>
                    </div>
                  )}
                </div>
                <div className="px-1">
                  <h4 className="font-display font-bold text-base leading-tight mb-1">{member.name}</h4>
                  <p className="text-primary text-xs font-medium uppercase tracking-wider">
                    {position}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
