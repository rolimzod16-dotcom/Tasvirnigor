import { useListTeamMembers } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { localize } from "@/lib/localize";

// ── Social icon SVGs (inline, no external dependency) ────────────────────────
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconTelegram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.9 4.26a1.5 1.5 0 0 0-1.55-.22L3.15 10.86c-1.04.41-1.03 1.63-.01 2.02l4.09 1.5 1.58 4.98c.2.62.98.82 1.44.38l2.27-2.15 4.42 3.25c.67.49 1.6.12 1.77-.7l3.05-14.38c.17-.8-.34-1.55-1-1.5zM10.1 14.9l-.7 3.3-1.07-3.39 7.92-7.51-6.15 7.6z" />
    </svg>
  );
}
function IconYouTube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.79 2.79 0 0 0-1.96-1.97C18.88 4 12 4 12 4s-6.88 0-8.58.45A2.79 2.79 0 0 0 1.46 6.42 29.15 29.15 0 0 0 1 12a29.15 29.15 0 0 0 .46 5.58A2.79 2.79 0 0 0 3.42 19.6C5.12 20 12 20 12 20s6.88 0 8.58-.45a2.79 2.79 0 0 0 1.96-1.97A29.15 29.15 0 0 0 23 12a29.15 29.15 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  );
}
function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IconTikTok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<string, React.FC<{ className?: string }>> = {
  instagram: IconInstagram,
  telegram: IconTelegram,
  youtube: IconYouTube,
  linkedin: IconLinkedIn,
  facebook: IconFacebook,
  tiktok: IconTikTok,
};

const PLATFORMS = ["instagram", "telegram", "youtube", "linkedin", "facebook", "tiktok"] as const;

// ── Animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
function TeamSkeleton() {
  return (
    <section id="team" className="py-24 md:py-32 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="mb-14">
          <div className="w-28 h-3 rounded-full bg-white/10 mb-5 animate-pulse" />
          <div className="w-56 h-8 rounded-lg bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex rounded-2xl overflow-hidden bg-[#181818] animate-pulse h-64" />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Team() {
  const { data: teamMembers, isLoading } = useListTeamMembers();
  const { lang } = useLanguage();

  if (isLoading) return <TeamSkeleton />;
  if (!teamMembers || teamMembers.length === 0) return null;

  return (
    <section id="team" className="py-24 md:py-32 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14"
        >
          <p className="section-label">
            {t(i18n.team.label, lang)}
          </p>
          <h2 className="font-display font-extrabold text-white leading-tight tracking-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
            {t(i18n.team.heading, lang)}
          </h2>
        </motion.div>

        {/* Card grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6"
        >
          {teamMembers.map((member) => {
            const position = localize(member as unknown as Record<string, unknown>, "position", lang);
            const bio = localize(member as unknown as Record<string, unknown>, "bio", lang);
            const experienceLines = member.experience
              ? member.experience.split("\n").map((l) => l.trim()).filter(Boolean)
              : [];
            const socialEntries = PLATFORMS.filter(
              (p) => member.socialLinks && (member.socialLinks as Record<string, string>)[p]
            );

            return (
              <motion.article
                key={member.id}
                variants={cardVariants}
                data-testid={`card-team-${member.id}`}
                className="group relative flex rounded-2xl overflow-hidden bg-[#141414]
                           border border-white/[0.06] hover:border-primary/30
                           transition-all duration-500
                           hover:shadow-[0_0_48px_-8px_rgba(196,145,10,0.18)]"
              >
                {/* LEFT: portrait photo */}
                <div className="relative flex-shrink-0 w-[42%] overflow-hidden">
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="absolute inset-0 w-full h-full object-cover object-top
                               transition-transform duration-700 ease-out
                               group-hover:scale-[1.07]"
                    loading="lazy"
                  />
                </div>

                {/* RIGHT: info */}
                <div className="flex flex-col justify-between gap-3 px-6 py-7 min-h-[280px]">

                  {/* Name + position */}
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-white text-xl leading-snug line-clamp-2">
                      {member.name}
                    </h3>
                    {position && (
                      <span className="inline-flex items-center max-w-full text-[10px] font-semibold
                                       tracking-[0.18em] uppercase text-primary border border-primary/30
                                       rounded-full px-3 py-1 bg-primary/[0.07] truncate">
                        {position}
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  {bio && (
                    <p className="text-white/50 text-sm leading-relaxed line-clamp-3">
                      {bio}
                    </p>
                  )}

                  {/* Experience bullets */}
                  {experienceLines.length > 0 && (
                    <ul className="space-y-1">
                      {experienceLines.slice(0, 3).map((line, i) => (
                        <li key={i} className="flex items-start gap-2 text-white/40 text-xs">
                          <span className="mt-[5px] flex-shrink-0 w-1 h-1 rounded-full bg-primary" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Social icons */}
                  {socialEntries.length > 0 && (
                    <div className="flex items-center gap-[18px] pt-1">
                      {socialEntries.map((platform) => {
                        const Icon = SOCIAL_ICONS[platform];
                        const url = (member.socialLinks as Record<string, string>)[platform];
                        return (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/35 hover:text-[#FAB037] transition-all duration-300
                                       hover:scale-[1.08] hover:-translate-y-0.5"
                            aria-label={platform}
                          >
                            <Icon className="w-7 h-7" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
