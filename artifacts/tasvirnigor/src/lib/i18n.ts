import type { Lang } from "@/contexts/language-context";

type T = Record<Lang, string>;

function t(map: T, lang: Lang): string {
  return map[lang] ?? map.en;
}

export { t };

export const i18n = {
  nav: {
    home: { en: "Home", ru: "Главная", tj: "Асосӣ" } as T,
    about: { en: "About", ru: "О нас", tj: "Дар бораи мо" } as T,
    services: { en: "Services", ru: "Услуги", tj: "Хизматҳо" } as T,
    portfolio: { en: "Portfolio", ru: "Портфолио", tj: "Портфолио" } as T,
    team: { en: "Team", ru: "Команда", tj: "Гурӯҳ" } as T,
    contacts: { en: "Contacts", ru: "Контакты", tj: "Тамос" } as T,
    adminLogin: { en: "Admin Login", ru: "Вход в панель", tj: "Вуруди маъмур" } as T,
  },
  hero: {
    tagline: { en: "Tajikistan · Est. 2015", ru: "Таджикистан · Осн. 2015", tj: "Тоҷикистон · Таъс. 2015" } as T,
    subtitle: {
      en: "A prestigious Central Asian film and animation studio. We craft cinematic narratives that transcend borders.",
      ru: "Престижная студия кино и анимации Центральной Азии. Мы создаём кинематографические нарративы, выходящие за рамки.",
      tj: "Студияи маъруфи кино ва анимацияи Осиёи Марказӣ. Мо нақлҳои синематографӣ месозем, ки аз сарҳадҳо гузаранд.",
    } as T,
    cta: { en: "Explore Our World", ru: "Исследовать наш мир", tj: "Ҷаҳони моро кашф кунед" } as T,
    scroll: { en: "Scroll", ru: "Прокрутить", tj: "Ба поён" } as T,
  },
  about: {
    label: { en: "About the Studio", ru: "О студии", tj: "Дар бораи студия" } as T,
    estLabel: { en: "Est.", ru: "Осн.", tj: "Таъс." } as T,
    location: { en: "Dushanbe, Tajikistan", ru: "Душанбе, Таджикистан", tj: "Душанбе, Тоҷикистон" } as T,
    stats: [
      { value: "10+", label: { en: "Years of craft", ru: "Лет работы", tj: "Соли фаъолият" } as T },
      { value: "40+", label: { en: "Productions", ru: "Проектов", tj: "Лоиҳаҳо" } as T },
      { value: "15+", label: { en: "Awards", ru: "Наград", tj: "Ҷоизаҳо" } as T },
      { value: "20+", label: { en: "Countries screened", ru: "Стран показа", tj: "Кишварҳои намоиш" } as T },
    ],
  },
  services: {
    label: { en: "Expertise", ru: "Компетенции", tj: "Тахассус" } as T,
    heading: { en: "Our Services", ru: "Наши услуги", tj: "Хизматҳои мо" } as T,
    items: [
      {
        title: { en: "Film Production", ru: "Кинопроизводство", tj: "Истеҳсоли кино" } as T,
        description: {
          en: "Full-scale cinematic production for feature films and shorts, utilizing state-of-the-art equipment and world-class crew.",
          ru: "Полномасштабное кинопроизводство для полнометражных и короткометражных фильмов с использованием передового оборудования и команды мирового уровня.",
          tj: "Истеҳсоли пурмиқёси синематографӣ барои филмҳои пурра ва кӯтоҳ, бо таҷҳизоти замонавӣ ва гурӯҳи ҷаҳонӣ.",
        } as T,
      },
      {
        title: { en: "Animation", ru: "Анимация", tj: "Аниматсия" } as T,
        description: {
          en: "2D and 3D animation services bringing imaginative worlds and characters to life with meticulous detail.",
          ru: "Услуги 2D и 3D анимации, воплощающие воображаемые миры и персонажей с тщательной детализацией.",
          tj: "Хизматҳои анимацияи 2D ва 3D, ки ҷаҳонҳо ва қаҳрамонони тасаввуротиро бо тафсилоти дақиқ зинда мекунад.",
        } as T,
      },
      {
        title: { en: "Post-Production", ru: "Постпродакшн", tj: "Постпродаксион" } as T,
        description: {
          en: "Expert editing, color grading, sound design, and VFX to refine and perfect your visual narrative.",
          ru: "Профессиональный монтаж, цветокоррекция, звуковой дизайн и VFX для совершенствования вашего визуального нарратива.",
          tj: "Монтажи касбӣ, тасҳеҳи ранг, тарроҳии садо ва VFX барои такмил додани нақли визуалии шумо.",
        } as T,
      },
      {
        title: { en: "Commercial Advertising", ru: "Рекламное производство", tj: "Таблиғоти тиҷоратӣ" } as T,
        description: {
          en: "High-impact commercial video production designed to elevate brands and captivate audiences.",
          ru: "Высокоэффективное производство рекламных роликов, призванное продвигать бренды и захватывать аудиторию.",
          tj: "Истеҳсоли видеои тиҷоратии баробар барои баланд бардоштани бренд ва ҷалб кардани тамошобин.",
        } as T,
      },
      {
        title: { en: "Documentaries", ru: "Документальное кино", tj: "Ҳуҷҷатнигорӣ" } as T,
        description: {
          en: "Compelling documentary filmmaking that captures truth, emotion, and the essence of the human experience.",
          ru: "Захватывающее документальное кино, передающее правду, эмоции и суть человеческого опыта.",
          tj: "Сохтани ҳуҷҷатномаҳои таъсирбахш, ки ҳақиқат, эҳсос ва моҳияти таҷрибаи инсониро мегиранд.",
        } as T,
      },
      {
        title: { en: "Motion Graphics", ru: "Моушн-графика", tj: "Графикаи ҳаракат" } as T,
        description: {
          en: "Dynamic visual designs and typography that communicate complex ideas with clarity and style.",
          ru: "Динамичные визуальные решения и типографика, передающие сложные идеи с ясностью и стилем.",
          tj: "Тарроҳиҳои визуалии динамикӣ ва типографика, ки идеяҳои мураккабро бо возеҳӣ ва сабк интиқол медиҳанд.",
        } as T,
      },
    ],
  },
  portfolio: {
    label: { en: "Selected Work", ru: "Избранные работы", tj: "Корҳои баргузида" } as T,
    heading: { en: "Portfolio", ru: "Портфолио", tj: "Портфолио" } as T,
    clickHint: {
      en: "Click any project to watch it on YouTube",
      ru: "Нажмите на проект, чтобы посмотреть на YouTube",
      tj: "Барои тамошо кардан дар YouTube лоиҳаро пахш кунед",
    } as T,
    featured: { en: "Featured", ru: "Главный", tj: "Барҷаста" } as T,
  },
  team: {
    label: { en: "The Creators", ru: "Создатели", tj: "Офаринандагон" } as T,
    heading: { en: "Our Team", ru: "Наша команда", tj: "Гурӯҳи мо" } as T,
  },
  contacts: {
    label: { en: "Get in Touch", ru: "Связаться с нами", tj: "Бо мо тамос гиред" } as T,
    heading: {
      en: "Let's create something extraordinary.",
      ru: "Давайте создадим что-то особенное.",
      tj: "Биёед чизе истисноӣ биофаринем.",
    } as T,
    subtext: {
      en: "Whether you have a specific project in mind or just want to explore possibilities, we're ready to bring your vision to life.",
      ru: "Есть ли у вас конкретный проект или вы просто хотите изучить возможности — мы готовы воплотить ваши идеи в жизнь.",
      tj: "Чи лоиҳаи мушаххас дошта бошед ё ҳамин тавр имкониятҳоро омӯзед, мо омодаем дидгоҳи шуморо зинда кунем.",
    } as T,
    email: { en: "Email", ru: "Эл. почта", tj: "Почтаи электронӣ" } as T,
    phone: { en: "Phone", ru: "Телефон", tj: "Телефон" } as T,
    studio: { en: "Studio", ru: "Студия", tj: "Студия" } as T,
  },
  footer: {
    rights: { en: "All rights reserved.", ru: "Все права защищены.", tj: "Ҳамаи ҳуқуқҳо ҳифз шудаанд." } as T,
    adminLogin: { en: "Admin Login", ru: "Вход в панель", tj: "Вуруди маъмур" } as T,
  },
  admin: {
    title: { en: "Content Management", ru: "Управление контентом", tj: "Идоракунии мазмун" } as T,
    subtitle: {
      en: "Manage your studio's website content from here.",
      ru: "Управляйте контентом сайта студии здесь.",
      tj: "Мазмуни вебсайти студияро аз ин ҷо идора кунед.",
    } as T,
    projects: { en: "Projects", ru: "Проекты", tj: "Лоиҳаҳо" } as T,
    team: { en: "Team", ru: "Команда", tj: "Гурӯҳ" } as T,
    about: { en: "About", ru: "О нас", tj: "Дар бораи мо" } as T,
    contacts: { en: "Contacts", ru: "Контакты", tj: "Тамос" } as T,
    logout: { en: "Logout", ru: "Выйти", tj: "Баромадан" } as T,
    administrator: { en: "Administrator", ru: "Администратор", tj: "Маъмур" } as T,
  },
  langLabels: {
    en: { en: "EN", ru: "EN", tj: "EN" } as T,
    ru: { en: "RU", ru: "RU", tj: "RU" } as T,
    tj: { en: "TJ", ru: "TJ", tj: "TJ" } as T,
    english: { en: "English", ru: "Английский", tj: "Англисӣ" } as T,
    russian: { en: "Russian", ru: "Русский", tj: "Русӣ" } as T,
    tajik: { en: "Tajik", ru: "Таджикский", tj: "Тоҷикӣ" } as T,
  },
};
