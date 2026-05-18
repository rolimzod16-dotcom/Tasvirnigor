import { motion } from "framer-motion";
import { Film, Palette, MonitorPlay, MonitorSmartphone, Video, Clapperboard, ArrowUpRight } from "lucide-react";
import { useLanguage, type Lang } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";

const ICONS = [Film, Palette, MonitorPlay, MonitorSmartphone, Video, Clapperboard];

/**
 * Service media sources — swap any `type: "image"` entry for:
 *   { type: "gif",   src: "/media/service-1.gif" }
 *   { type: "video", src: "/media/service-1.mp4" }
 * The <ServiceMedia> component renders the right element automatically.
 */
const SERVICE_MEDIA: Array<{ type: "image" | "gif" | "video"; src: string }> = [
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=800&q=80",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80",
  },
];

function ServiceMedia({
  media,
  alt,
  className,
}: {
  media: (typeof SERVICE_MEDIA)[number];
  alt: string;
  className?: string;
}) {
  if (media.type === "video") {
    return (
      <video
        src={media.src}
        autoPlay
        loop
        muted
        playsInline
        className={className}
      />
    );
  }
  return (
    <img
      src={media.src}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function Services() {
  const { lang } = useLanguage();

  const services = i18n.services.items;

  return (
    <section id="services" className="py-24 md:py-32 bg-[#f8f7f5]">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-14"
        >
          <div>
            <p className="section-label">{t(i18n.services.label, lang)}</p>
            <h2 className="section-heading text-[#141414]">
              {t(i18n.services.heading, lang)}
            </h2>
          </div>
          <p className="text-[#888] text-sm max-w-xs leading-relaxed font-light md:text-right">
            {lang === "ru"
              ? "Полный цикл производства — от идеи до финального экрана"
              : lang === "tj"
              ? "Давраи пурраи истеҳсол — аз идея то экрани ниҳоӣ"
              : "Full production cycle — from concept to final screen"}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {/* Card 1 — wide featured (spans 2 cols on desktop) */}
          <motion.div
            variants={cardVariant}
            className="group lg:col-span-2 bg-white rounded-2xl overflow-hidden border border-[#e8e8e8] hover:border-primary/20 hover:shadow-[0_16px_56px_-12px_rgba(0,0,0,0.13)] transition-all duration-400 cursor-default"
          >
            {/* Media container */}
            <div className="relative overflow-hidden aspect-[16/9] lg:aspect-[2.4/1] bg-[#111]">
              <ServiceMedia
                media={SERVICE_MEDIA[0]}
                alt={t(services[0].title, lang)}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04] opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-400" />
              <span className="absolute top-5 right-5 text-white/50 font-display font-bold text-3xl select-none leading-none group-hover:text-primary transition-colors duration-300">
                01
              </span>
            </div>
            {/* Content */}
            <div className="p-6 md:p-7 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#fdf5e4] text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Film className="w-4 h-4" />
                  </span>
                  <h3 className="font-display font-bold text-[#141414] text-lg">
                    {t(services[0].title, lang)}
                  </h3>
                </div>
                <p className="text-[#666] text-sm font-light leading-relaxed max-w-lg">
                  {t(services[0].description, lang)}
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#ccc] group-hover:text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-1" />
            </div>
          </motion.div>

          {/* Card 2 */}
          <ServiceCard
            index={1}
            service={services[1]}
            media={SERVICE_MEDIA[1]}
            Icon={ICONS[1]}
            lang={lang}
            aspectClass="aspect-[4/3]"
          />

          {/* Cards 3, 4, 5 — equal thirds row */}
          {[2, 3, 4].map((i) => (
            <ServiceCard
              key={i}
              index={i}
              service={services[i]}
              media={SERVICE_MEDIA[i]}
              Icon={ICONS[i]}
              lang={lang}
              aspectClass="aspect-[4/3]"
            />
          ))}

          {/* Card 6 — full-width landscape */}
          <motion.div
            variants={cardVariant}
            className="group lg:col-span-3 bg-white rounded-2xl overflow-hidden border border-[#e8e8e8] hover:border-primary/20 hover:shadow-[0_16px_56px_-12px_rgba(0,0,0,0.13)] transition-all duration-400 cursor-default"
          >
            <div className="lg:flex lg:items-stretch">
              {/* Media */}
              <div className="relative overflow-hidden aspect-[16/9] lg:aspect-auto lg:w-[55%] bg-[#111] shrink-0">
                <ServiceMedia
                  media={SERVICE_MEDIA[5]}
                  alt={t(services[5].title, lang)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04] opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 lg:bg-gradient-to-r lg:from-transparent lg:to-black/40" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-400" />
                <span className="absolute top-5 right-5 text-white/50 font-display font-bold text-3xl select-none leading-none group-hover:text-primary transition-colors duration-300">
                  06
                </span>
              </div>
              {/* Content */}
              <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#fdf5e4] text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Clapperboard className="w-4.5 h-4.5" />
                  </span>
                  <h3 className="font-display font-bold text-[#141414] text-xl">
                    {t(services[5].title, lang)}
                  </h3>
                </div>
                <p className="text-[#666] text-sm md:text-base font-light leading-relaxed max-w-md mb-5">
                  {t(services[5].description, lang)}
                </p>
                <div className="flex items-center gap-2 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>
                    {lang === "ru" ? "Узнать больше" : lang === "tj" ? "Бештар донед" : "Learn more"}
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ServiceCard({
  index,
  service,
  media,
  Icon,
  lang,
  aspectClass,
}: {
  index: number;
  service: (typeof i18n.services.items)[number];
  media: (typeof SERVICE_MEDIA)[number];
  Icon: React.ElementType;
  lang: Lang;
  aspectClass: string;
}) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      variants={cardVariant}
      className="group bg-white rounded-2xl overflow-hidden border border-[#e8e8e8] hover:border-primary/20 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] transition-all duration-400 cursor-default"
    >
      {/* Media container — swap img for <video> or <img src=".gif"> */}
      <div className={`relative overflow-hidden ${aspectClass} bg-[#111]`}>
        <ServiceMedia
          media={media}
          alt={t(service.title, lang)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05] opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-400" />
        <span className="absolute top-4 right-4 text-white/45 font-display font-bold text-2xl select-none leading-none group-hover:text-primary transition-colors duration-300">
          {num}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#fdf5e4] text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </span>
            <h3 className="font-display font-bold text-[#141414] text-base leading-tight">
              {t(service.title, lang)}
            </h3>
          </div>
          <p className="text-[#777] text-sm font-light leading-relaxed line-clamp-3">
            {t(service.description, lang)}
          </p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[#ddd] group-hover:text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-0.5" />
      </div>
    </motion.div>
  );
}
