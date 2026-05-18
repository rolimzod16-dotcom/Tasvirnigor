import { useListTeamMembers } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { localize } from "@/lib/localize";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

export function Team() {
  const { data: teamMembers, isLoading } = useListTeamMembers();
  const { lang } = useLanguage();

  if (isLoading) {
    return (
      <section id="team" className="py-24 md:py-32 bg-[#f8f7f5]">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-16">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-[#eee] animate-pulse aspect-[3/4]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!teamMembers || teamMembers.length === 0) return null;

  return (
    <section id="team" className="py-24 md:py-32 bg-[#f8f7f5]">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14"
        >
          <p className="section-label">{t(i18n.team.label, lang)}</p>
          <h2 className="section-heading text-[#141414]">
            {t(i18n.team.heading, lang)}
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
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
                <div className="aspect-[3/4] relative rounded-2xl overflow-hidden mb-4 border border-[#e4e4e4] group-hover:border-primary/30 group-hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] transition-all duration-400">
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

                  {bio && (
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-350">
                      <p className="text-white/90 text-xs leading-relaxed line-clamp-4">
                        {bio}
                      </p>
                    </div>
                  )}

                  {!bio && (
                    <div className="absolute bottom-0 inset-x-0 p-4">
                      <h4 className="font-display font-bold text-white text-sm leading-tight">
                        {member.name}
                      </h4>
                      <p className="text-primary text-[11px] font-semibold uppercase tracking-wider mt-0.5">
                        {position}
                      </p>
                    </div>
                  )}
                </div>
                {bio && (
                  <div className="px-1">
                    <h4 className="font-display font-bold text-[#141414] text-base leading-tight mb-1">
                      {member.name}
                    </h4>
                    <p className="text-primary text-xs font-semibold uppercase tracking-wider">
                      {position}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
