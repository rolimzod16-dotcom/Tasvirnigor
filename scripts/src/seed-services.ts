import { db, servicesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const SERVICES = [
  {
    title: "Video Production",
    titleRu: "Видеопроизводство",
    titleTj: "Истеҳсоли видео",
    description: "Full-cycle video production from concept development and scriptwriting to filming and final delivery. We create corporate films, documentaries, music videos, and branded content.",
    descriptionRu: "Полный цикл видеопроизводства — от разработки концепции и написания сценария до съёмок и финального монтажа. Корпоративные фильмы, документальное кино, музыкальные клипы и брендированный контент.",
    descriptionTj: "Давраи пурраи истеҳсоли видео — аз коркарди консепсия ва навиштани сенарий то снимкагирӣ ва таҳрири ниҳоӣ. Филмҳои корпоративӣ, ҳуҷҷатӣ, клипҳои мусиқӣ ва мундариҷаи бренд.",
    mediaUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80",
    mediaType: "image",
    sortOrder: 1,
  },
  {
    title: "Animation & Motion Graphics",
    titleRu: "Анимация и моушн-графика",
    titleTj: "Анимация ва графикаи ҳаракат",
    description: "Dynamic motion graphics and animation for broadcast, digital platforms, and presentations. We bring ideas to life through compelling visual storytelling and kinetic design.",
    descriptionRu: "Динамичная моушн-графика и анимация для телевидения, цифровых платформ и презентаций. Мы воплощаем идеи в жизнь через выразительный визуальный сторителлинг и кинетический дизайн.",
    descriptionTj: "Графикаи динамикӣ ва анимация барои телевизион, платформаҳои рақамӣ ва презентатсияҳо. Мо идеяҳоро тавассути нақлиёти визуалии ҷолиб ва дизайни кинетикӣ зинда мекунем.",
    mediaUrl: "https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=800&q=80",
    mediaType: "image",
    sortOrder: 2,
  },
  {
    title: "2D Animation",
    titleRu: "2D-анимация",
    titleTj: "Анимацияи 2D",
    description: "Hand-crafted 2D animation for series, shorts, explainer videos, and advertising. Our artists combine traditional techniques with modern digital workflows to deliver distinctive visual styles.",
    descriptionRu: "Авторская 2D-анимация для сериалов, короткометражек, explainer-видео и рекламы. Наши художники сочетают традиционные техники с современными цифровыми процессами.",
    descriptionTj: "Анимацияи 2D барои силсилаҳо, филмҳои кӯтоҳ, видеоҳои шарҳдиҳанда ва реклама. Рассомони мо усулҳои анъанавиро бо равандҳои рақамии муосир муттаҳид мекунанд.",
    mediaUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
    mediaType: "image",
    sortOrder: 3,
  },
  {
    title: "3D Animation",
    titleRu: "3D-анимация",
    titleTj: "Анимацияи 3D",
    description: "Photorealistic 3D animation and visualisation for architecture, product launches, entertainment, and scientific communication. From modelling to final render — all in-house.",
    descriptionRu: "Фотореалистичная 3D-анимация и визуализация для архитектуры, запуска продуктов, развлечений и научной коммуникации. От моделирования до финального рендера — всё в одной студии.",
    descriptionTj: "Анимация ва визуализатсияи 3D-и фотореалистӣ барои меъморӣ, ворид кардани маҳсулот, фароғат ва коммуникатсияи илмӣ.",
    mediaUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
    mediaType: "image",
    sortOrder: 4,
  },
  {
    title: "Commercial Advertising",
    titleRu: "Коммерческая реклама",
    titleTj: "Рекламаи тиҷоратӣ",
    description: "High-impact advertising content for television, digital, and out-of-home campaigns. We produce commercials that connect brands with their audiences through authentic, emotionally resonant stories.",
    descriptionRu: "Эффектный рекламный контент для телевидения, digital-каналов и наружной рекламы. Мы создаём ролики, которые соединяют бренды с аудиторией через подлинные истории.",
    descriptionTj: "Мундариҷаи реклама барои телевизион, каналҳои рақамӣ ва рекламаи берунӣ. Мо роликҳое месозем, ки брендҳоро тавассути ҳикояҳои ҳақиқӣ бо аудитория мепайванданд.",
    mediaUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
    mediaType: "image",
    sortOrder: 5,
  },
  {
    title: "Photography",
    titleRu: "Фотография",
    titleTj: "Аксбардорӣ",
    description: "Professional photography for editorial, commercial, portrait, and event projects. Our photographers combine technical mastery with an artist's eye to produce images that tell lasting stories.",
    descriptionRu: "Профессиональная фотосъёмка для редакционных, коммерческих, портретных и событийных проектов. Наши фотографы сочетают техническое мастерство с художественным взглядом.",
    descriptionTj: "Аксбардории касбӣ барои лоиҳаҳои таҳририятӣ, тиҷоратӣ, портретӣ ва рӯйдодӣ. Аксбардорони мо маҳорати техникиро бо нигоҳи бадеӣ муттаҳид мекунанд.",
    mediaUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
    mediaType: "image",
    sortOrder: 6,
  },
  {
    title: "Post Production",
    titleRu: "Постпродакшн",
    titleTj: "Постпродаксн",
    description: "Comprehensive post-production services including picture editing, colour grading, visual effects compositing, and delivery in all major formats. We refine raw footage into polished final works.",
    descriptionRu: "Комплексные услуги постпродакшна: монтаж, цветокоррекция, compositing визуальных эффектов и доставка во всех форматах. Превращаем исходный материал в полированный финальный продукт.",
    descriptionTj: "Хидматҳои комплексии постпродаксн: монтаж, ислоҳи ранг, compositing-и эффектҳои визуалӣ ва таҳвили дар ҳама форматҳо.",
    mediaUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
    mediaType: "image",
    sortOrder: 7,
  },
  {
    title: "Sound Design",
    titleRu: "Звуковой дизайн",
    titleTj: "Дизайни садо",
    description: "Original music composition, sound design, Foley recording, and audio mixing for film, animation, and advertising. Every sound is crafted to reinforce the emotional impact of the image.",
    descriptionRu: "Оригинальная музыкальная композиция, звуковой дизайн, запись Фоли и сведение аудио для кино, анимации и рекламы. Каждый звук создан для усиления эмоционального воздействия.",
    descriptionTj: "Композитсияи мусиқии оригиналӣ, дизайни садо, сабти Foley ва омезиши аудио барои кино, анимация ва реклама.",
    mediaUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    mediaType: "image",
    sortOrder: 8,
  },
  {
    title: "Visual Effects (VFX)",
    titleRu: "Визуальные эффекты (VFX)",
    titleTj: "Эффектҳои визуалӣ (VFX)",
    description: "Seamless visual effects integration for film and television — from invisible wire removal and digital set extensions to full CG environments and creature animation.",
    descriptionRu: "Бесшовная интеграция визуальных эффектов для кино и телевидения — от незаметного удаления тросов и цифрового расширения декораций до полных CG-окружений и анимации существ.",
    descriptionTj: "Интегратсияи беваҷа эффектҳои визуалӣ барои кино ва телевизион — аз хориж кардани симҳо ва васеъ кардани декоратсияҳо то муҳитҳои CG ва анимацияи ҷонзотҳо.",
    mediaUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    mediaType: "image",
    sortOrder: 9,
  },
  {
    title: "Branding & Creative Direction",
    titleRu: "Брендинг и креативное направление",
    titleTj: "Брендинг ва роҳбарии эҷодӣ",
    description: "Strategic brand identity, visual communication systems, and creative direction for studios, companies, and cultural institutions. We build brands that stand apart and endure.",
    descriptionRu: "Стратегическая идентичность бренда, системы визуальной коммуникации и креативное руководство для студий, компаний и культурных институций. Мы создаём бренды, которые выделяются и остаются.",
    descriptionTj: "Ҳувияти стратегии бренд, системаҳои коммуникатсияи визуалӣ ва роҳбарии эҷодӣ барои студияҳо, ширкатҳо ва муассисаҳои фарҳангӣ.",
    mediaUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    mediaType: "image",
    sortOrder: 10,
  },
];

async function main() {
  const existing = await db.$count(servicesTable);
  if (existing > 0) {
    console.log(`Services already seeded (${existing} rows). Skipping.`);
    process.exit(0);
  }

  await db.insert(servicesTable).values(SERVICES);
  console.log(`Seeded ${SERVICES.length} services.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
