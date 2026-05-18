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
    <section id="contacts" className="py-24 md:py-32 bg-white border-t border-[#ebebeb]">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
            className="lg:col-span-5"
          >
            <p className="section-label">{t(i18n.contacts.label, lang)}</p>
            <h2 className="section-heading text-[#141414] mb-6">
              {t(i18n.contacts.heading, lang)}
            </h2>
            <p className="text-[#666] font-light text-base leading-relaxed mb-10 max-w-sm">
              {t(i18n.contacts.subtext, lang)}
            </p>

            <div className="flex flex-wrap gap-3">
              {ensureProtocol(contacts.telegram) && (
                <a
                  href={ensureProtocol(contacts.telegram)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full border border-[#e0e0e0] flex items-center justify-center text-[#555] hover:border-primary hover:text-primary hover:bg-[#fdf5e4] transition-all duration-200"
                >
                  <SiTelegram className="w-4.5 h-4.5" />
                </a>
              )}
              {ensureProtocol(contacts.instagram) && (
                <a
                  href={ensureProtocol(contacts.instagram)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full border border-[#e0e0e0] flex items-center justify-center text-[#555] hover:border-primary hover:text-primary hover:bg-[#fdf5e4] transition-all duration-200"
                >
                  <SiInstagram className="w-4.5 h-4.5" />
                </a>
              )}
              {ensureProtocol(contacts.youtube) && (
                <a
                  href={ensureProtocol(contacts.youtube)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full border border-[#e0e0e0] flex items-center justify-center text-[#555] hover:border-primary hover:text-primary hover:bg-[#fdf5e4] transition-all duration-200"
                >
                  <SiYoutube className="w-4.5 h-4.5" />
                </a>
              )}
              {ensureProtocol(contacts.facebook) && (
                <a
                  href={ensureProtocol(contacts.facebook)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full border border-[#e0e0e0] flex items-center justify-center text-[#555] hover:border-primary hover:text-primary hover:bg-[#fdf5e4] transition-all duration-200"
                >
                  <SiFacebook className="w-4.5 h-4.5" />
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, delay: 0.15 }}
            className="lg:col-span-7 flex flex-col justify-center space-y-6"
          >
            {contacts.email && (
              <a
                href={`mailto:${contacts.email}`}
                className="group flex items-center gap-5 p-5 rounded-2xl border border-[#ebebeb] hover:border-primary/30 hover:bg-[#fdf9f2] hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] transition-all duration-300"
              >
                <div className="w-11 h-11 bg-[#fdf5e4] rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[#888] text-xs font-semibold uppercase tracking-wider mb-0.5">
                    {t(i18n.contacts.email, lang)}
                  </p>
                  <p className="font-semibold text-[#141414] group-hover:text-primary transition-colors text-base">
                    {contacts.email}
                  </p>
                </div>
              </a>
            )}

            {contacts.phone && (
              <a
                href={`tel:${contacts.phone}`}
                className="group flex items-center gap-5 p-5 rounded-2xl border border-[#ebebeb] hover:border-primary/30 hover:bg-[#fdf9f2] hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] transition-all duration-300"
              >
                <div className="w-11 h-11 bg-[#fdf5e4] rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[#888] text-xs font-semibold uppercase tracking-wider mb-0.5">
                    {t(i18n.contacts.phone, lang)}
                  </p>
                  <p className="font-semibold text-[#141414] group-hover:text-primary transition-colors text-base">
                    {contacts.phone}
                  </p>
                </div>
              </a>
            )}

            {contacts.address && (
              <div className="group flex items-start gap-5 p-5 rounded-2xl border border-[#ebebeb] hover:border-primary/30 hover:bg-[#fdf9f2] transition-all duration-300">
                <div className="w-11 h-11 bg-[#fdf5e4] rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0 mt-0.5">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[#888] text-xs font-semibold uppercase tracking-wider mb-0.5">
                    {t(i18n.contacts.studio, lang)}
                  </p>
                  <p className="font-semibold text-[#141414] text-base whitespace-pre-wrap leading-snug">
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
