import { useGetContacts } from "@workspace/api-client-react";
import { SiTelegram, SiInstagram, SiYoutube, SiFacebook } from "react-icons/si";
import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { ensureProtocol } from "@/lib/utils";

export function Contacts() {
  const { data: contacts, isLoading } = useGetContacts();
  const { lang } = useLanguage();

  if (isLoading) return null;
  if (!contacts) return null;

  return (
    <section id="contacts" className="py-32 bg-background border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
              {t(i18n.contacts.label, lang)}
            </h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground mb-8">
              {t(i18n.contacts.heading, lang)}
            </h3>
            <p className="text-muted-foreground font-light text-lg mb-12 max-w-md">
              {t(i18n.contacts.subtext, lang)}
            </p>

            <div className="flex gap-4">
              {ensureProtocol(contacts.telegram) && (
                <a href={ensureProtocol(contacts.telegram)!} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors">
                  <SiTelegram className="w-5 h-5" />
                </a>
              )}
              {ensureProtocol(contacts.instagram) && (
                <a href={ensureProtocol(contacts.instagram)!} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors">
                  <SiInstagram className="w-5 h-5" />
                </a>
              )}
              {ensureProtocol(contacts.youtube) && (
                <a href={ensureProtocol(contacts.youtube)!} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors">
                  <SiYoutube className="w-5 h-5" />
                </a>
              )}
              {ensureProtocol(contacts.facebook) && (
                <a href={ensureProtocol(contacts.facebook)!} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors">
                  <SiFacebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center space-y-8"
          >
            {contacts.email && (
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-card border border-border/50 rounded-lg flex items-center justify-center group-hover:border-primary transition-colors shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">{t(i18n.contacts.email, lang)}</h4>
                  <a href={`mailto:${contacts.email}`} className="text-muted-foreground hover:text-foreground transition-colors">
                    {contacts.email}
                  </a>
                </div>
              </div>
            )}

            {contacts.phone && (
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-card border border-border/50 rounded-lg flex items-center justify-center group-hover:border-primary transition-colors shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">{t(i18n.contacts.phone, lang)}</h4>
                  <a href={`tel:${contacts.phone}`} className="text-muted-foreground hover:text-foreground transition-colors">
                    {contacts.phone}
                  </a>
                </div>
              </div>
            )}

            {contacts.address && (
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-card border border-border/50 rounded-lg flex items-center justify-center group-hover:border-primary transition-colors shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">{t(i18n.contacts.studio, lang)}</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {contacts.address}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
