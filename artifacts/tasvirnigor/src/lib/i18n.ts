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
    comics: { en: "Comics", ru: "Комиксы", tj: "Комикс" } as T,
    team: { en: "Team", ru: "Команда", tj: "Гурӯҳ" } as T,
    contacts: { en: "Contacts", ru: "Контакты", tj: "Тамос" } as T,
    adminLogin: { en: "Admin Login", ru: "Вход в панель", tj: "Вуруди маъмур" } as T,
    backToHome: { en: "Back to Home", ru: "На главную", tj: "Ба саҳифаи асосӣ" } as T,
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
    viewAll: { en: "View All Services", ru: "Все услуги", tj: "Ҳамаи хидматҳо" } as T,
    comingSoon: { en: "Services coming soon.", ru: "Услуги появятся в ближайшее время.", tj: "Хидматҳо ба зудӣ илова мешаванд." } as T,
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
    viewAll: { en: "View Full Portfolio", ru: "Полное портфолио", tj: "Портфолиои пурра" } as T,
    filterAll: { en: "All", ru: "Все", tj: "Ҳама" } as T,
    noProjects: { en: "No projects found.", ru: "Проекты не найдены.", tj: "Лоиҳаҳо ёфт нашуданд." } as T,
    dragHint: {
      en: "Drag or swipe to explore",
      ru: "Перетащите или проведите пальцем",
      tj: "Кашед ё каҷ кунед",
    } as T,
    noFeatured: {
      en: "No projects yet.",
      ru: "Проектов пока нет.",
      tj: "Лоиҳаҳо ҳанӯз нестанд.",
    } as T,
  },
  team: {
    label: { en: "The Creators", ru: "Создатели", tj: "Офаринандагон" } as T,
    heading: { en: "Our Team", ru: "Наша команда", tj: "Гурӯҳи мо" } as T,
  },
  partners: {
    label: { en: "Trusted By", ru: "Нам доверяют", tj: "Боварманд" } as T,
    heading: { en: "Our Partners", ru: "Наши партнёры", tj: "Шарикони мо" } as T,
    nav: { en: "Partners", ru: "Партнёры", tj: "Шарикон" } as T,
    empty: {
      en: "No partners yet.",
      ru: "Партнёры ещё не добавлены.",
      tj: "Ҳанӯз шарик илова нашудааст.",
    } as T,
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
    workingHours: { en: "Working Hours", ru: "Часы работы", tj: "Соатҳои корӣ" } as T,
  },
  footer: {
    rights: { en: "All rights reserved.", ru: "Все права защищены.", tj: "Ҳамаи ҳуқуқҳо ҳифз шудаанд." } as T,
    adminLogin: { en: "Admin Login", ru: "Вход в панель", tj: "Вуруди маъмур" } as T,
  },

  // --- Login page ---
  login: {
    title: { en: "Tasvirnigor Admin", ru: "Панель администратора", tj: "Панели маъмур" } as T,
    description: {
      en: "Enter the master password to access the CMS",
      ru: "Введите мастер-пароль для доступа к системе",
      tj: "Барои дастрасӣ рамзро ворид кунед",
    } as T,
    passwordLabel: { en: "Password", ru: "Пароль", tj: "Рамз" } as T,
    loginBtn: { en: "Login", ru: "Войти", tj: "Воридан" } as T,
    authenticating: { en: "Authenticating...", ru: "Вход...", tj: "Тасдиқ..." } as T,
    successTitle: { en: "Logged in successfully", ru: "Вход выполнен", tj: "Бомуваффақият ворид шудед" } as T,
    failedTitle: { en: "Login failed", ru: "Ошибка входа", tj: "Хатои вуруд" } as T,
    invalidPassword: { en: "Invalid password", ru: "Неверный пароль", tj: "Рамз нодуруст аст" } as T,
  },

  // --- Validation messages ---
  validation: {
    passwordRequired: { en: "Password is required", ru: "Введите пароль", tj: "Рамзро ворид кунед" } as T,
    titleRequired: { en: "Title (EN) is required", ru: "Заголовок (EN) обязателен", tj: "Унвон (EN) лозим аст" } as T,
    nameRequired: { en: "Name is required", ru: "Введите имя", tj: "Номро ворид кунед" } as T,
    positionRequired: { en: "Position (EN) is required", ru: "Должность (EN) обязательна", tj: "Вазифа (EN) лозим аст" } as T,
    headlineRequired: { en: "Headline (EN) is required", ru: "Заголовок (EN) обязателен", tj: "Унвон (EN) лозим аст" } as T,
    bodyRequired: { en: "Body (EN) is required", ru: "Текст (EN) обязателен", tj: "Матн (EN) лозим аст" } as T,
    urlInvalid: { en: "Must be a valid URL", ru: "Введите корректный URL", tj: "URL дуруст ворид кунед" } as T,
    bannerRequired: { en: "Banner image is required", ru: "Загрузите изображение баннера", tj: "Расми баннерро бор кунед" } as T,
    photoRequired: { en: "Photo is required", ru: "Загрузите фото", tj: "Аксро бор кунед" } as T,
    emailInvalid: { en: "Invalid email address", ru: "Неверный адрес электронной почты", tj: "Почтаи электронӣ нодуруст аст" } as T,
  },

  // --- Comics (public section) ---
  comics: {
    label: { en: "Comics & Manga", ru: "Комиксы и манга", tj: "Комикс ва манга" } as T,
    heading: { en: "Comics", ru: "Комиксы", tj: "Комикс" } as T,
    subtitle: {
      en: "Read our original comics and manga online, free.",
      ru: "Читайте наши оригинальные комиксы онлайн, бесплатно.",
      tj: "Комиксҳои аслии моро онлайн, ройгон хонед.",
    } as T,
    chapters: { en: "chapters", ru: "гл.", tj: "боб" } as T,
    chapterList: { en: "Chapters", ru: "Главы", tj: "Бобҳо" } as T,
    pages: { en: "pages", ru: "стр.", tj: "саҳ." } as T,
    readNow: { en: "Read", ru: "Читать", tj: "Хондан" } as T,
    startReading: { en: "Start Reading", ru: "Начать чтение", tj: "Хондан оғоз кунед" } as T,
    backToComics: { en: "All Comics", ru: "Все комиксы", tj: "Ҳама комикс" } as T,
    notFound: { en: "Comic not found", ru: "Комикс не найден", tj: "Комикс ёфт нашуд" } as T,
    prevChapter: { en: "Previous", ru: "Назад", tj: "Қаблӣ" } as T,
    nextChapter: { en: "Next Chapter", ru: "Следующая глава", tj: "Боби баъдӣ" } as T,
    noPagesYet: { en: "No pages uploaded yet", ru: "Страницы ещё не загружены", tj: "Саҳифаҳо ҳанӯз бор нашудаанд" } as T,
    noneInCategory: { en: "No comics in this category", ru: "Нет комиксов в этой категории", tj: "Дар ин категория комикс нест" } as T,
  },

  // --- Admin panel common ---
  admin: {
    title: { en: "Content Management", ru: "Управление контентом", tj: "Идоракунии мазмун" } as T,
    subtitle: {
      en: "Manage your studio's website content from here.",
      ru: "Управляйте контентом сайта студии здесь.",
      tj: "Мазмуни вебсайти студияро аз ин ҷо идора кунед.",
    } as T,
    projects: { en: "Projects", ru: "Проекты", tj: "Лоиҳаҳо" } as T,
    comics: { en: "Comics", ru: "Комиксы", tj: "Комикс" } as T,
    team: { en: "Team", ru: "Команда", tj: "Гурӯҳ" } as T,
    about: { en: "About", ru: "О нас", tj: "Дар бораи мо" } as T,
    contacts: { en: "Contacts", ru: "Контакты", tj: "Тамос" } as T,
    partners: { en: "Partners", ru: "Партнёры", tj: "Шарикон" } as T,
    services: { en: "Services", ru: "Услуги", tj: "Хизматҳо" } as T,
    logout: { en: "Logout", ru: "Выйти", tj: "Баромадан" } as T,
    administrator: { en: "Administrator", ru: "Администратор", tj: "Маъмур" } as T,
    loading: { en: "Loading Dashboard", ru: "Загрузка панели...", tj: "Бор кардани панел..." } as T,
  },

  // --- Admin form strings ---
  form: {
    // Common
    saveChanges: { en: "Save Changes", ru: "Сохранить", tj: "Нигоҳ доштан" } as T,
    saving: { en: "Saving...", ru: "Сохранение...", tj: "Нигоҳ доштан..." } as T,
    sortOrder: { en: "Sort Order", ru: "Порядок сортировки", tj: "Тартиби сортировка" } as T,
    bannerImage: { en: "Banner Image", ru: "Изображение баннера", tj: "Расми баннер" } as T,
    photo: { en: "Photo", ru: "Фото", tj: "Акс" } as T,
    title: { en: "Title", ru: "Заголовок", tj: "Унвон" } as T,
    description: { en: "Description", ru: "Описание", tj: "Тавсиф" } as T,
    youtubeUrl: { en: "YouTube URL", ru: "Ссылка YouTube", tj: "Пайванди YouTube" } as T,
    youtubePlaceholder: { en: "https://youtube.com/watch?v=...", ru: "https://youtube.com/watch?v=...", tj: "https://youtube.com/watch?v=..." } as T,
    fullName: { en: "Full Name", ru: "Полное имя", tj: "Номи пурра" } as T,
    nameLangNote: { en: "Name is the same in all languages", ru: "Имя одинаково на всех языках", tj: "Ном дар ҳама забонҳо якон аст" } as T,
    position: { en: "Position", ru: "Должность", tj: "Вазифа" } as T,
    bio: { en: "Bio", ru: "Биография", tj: "Тарҷумаи ҳол" } as T,
    headline: { en: "Headline", ru: "Заголовок", tj: "Унвон" } as T,
    bodyText: { en: "Body Text", ru: "Основной текст", tj: "Матни асосӣ" } as T,
    missionStatement: { en: "Mission Statement", ru: "Миссия", tj: "Изҳорияи рисолат" } as T,
    foundedYear: { en: "Founded Year", ru: "Год основания", tj: "Соли таъсис" } as T,
    foundedPlaceholder: { en: "e.g. 2015", ru: "напр. 2015", tj: "м. 2015" } as T,
    address: { en: "Address", ru: "Адрес", tj: "Суроға" } as T,
    general: { en: "General", ru: "Общее", tj: "Умумӣ" } as T,
    socialLinks: { en: "Social Links", ru: "Социальные сети", tj: "Шабакаҳои иҷтимоӣ" } as T,
    telegramUrl: { en: "Telegram URL", ru: "Ссылка Telegram", tj: "Пайванди Telegram" } as T,
    instagramUrl: { en: "Instagram URL", ru: "Ссылка Instagram", tj: "Пайванди Instagram" } as T,
    youtubeUrlLabel: { en: "YouTube URL", ru: "Ссылка YouTube", tj: "Пайванди YouTube" } as T,
    facebookUrl: { en: "Facebook URL", ru: "Ссылка Facebook", tj: "Пайванди Facebook" } as T,
    linkedinUrl: { en: "LinkedIn URL", ru: "Ссылка LinkedIn", tj: "Пайванди LinkedIn" } as T,
    tiktokUrl: { en: "TikTok URL", ru: "Ссылка TikTok", tj: "Пайванди TikTok" } as T,
    experience: { en: "Experience Highlights", ru: "Опыт работы", tj: "Таҷрибаи кор" } as T,
    experiencePlaceholder: { en: "One highlight per line, e.g.\n10+ years in animation\nDGA Award winner", ru: "Каждый пункт с новой строки", tj: "Ҳар нукта аз сатри нав" } as T,
    memberSocialLinks: { en: "Member Social Links", ru: "Соцсети участника", tj: "Шабакаҳои узв" } as T,

    // Projects
    addProject: { en: "Add Project", ru: "Добавить проект", tj: "Илова кардани лоиҳа" } as T,
    editProject: { en: "Edit Project", ru: "Редактировать проект", tj: "Таҳрири лоиҳа" } as T,
    createProject: { en: "Create Project", ru: "Создать проект", tj: "Сохтани лоиҳа" } as T,
    updateProject: { en: "Update Project", ru: "Обновить проект", tj: "Нав кардани лоиҳа" } as T,
    projectCreated: { en: "Project created successfully", ru: "Проект создан", tj: "Лоиҳа сохта шуд" } as T,
    projectUpdated: { en: "Project updated successfully", ru: "Проект обновлён", tj: "Лоиҳа нав шуд" } as T,
    projectDeleted: { en: "Project deleted", ru: "Проект удалён", tj: "Лоиҳа ҳазф шуд" } as T,
    deleteProjectConfirm: {
      en: "Are you sure you want to delete this project?",
      ru: "Вы уверены, что хотите удалить этот проект?",
      tj: "Оё мехоҳед ин лоиҳаро ҳазф кунед?",
    } as T,
    loadingProjects: { en: "Loading projects...", ru: "Загрузка проектов...", tj: "Бор кардани лоиҳаҳо..." } as T,

    // Team
    addMember: { en: "Add Member", ru: "Добавить сотрудника", tj: "Илова кардани узв" } as T,
    editMember: { en: "Edit Team Member", ru: "Редактировать сотрудника", tj: "Таҳрири узв" } as T,
    createMember: { en: "Create Member", ru: "Создать сотрудника", tj: "Сохтани узв" } as T,
    updateMember: { en: "Update Member", ru: "Обновить сотрудника", tj: "Нав кардани узв" } as T,
    memberCreated: { en: "Team member created successfully", ru: "Сотрудник добавлен", tj: "Узви гурӯҳ илова шуд" } as T,
    memberUpdated: { en: "Team member updated successfully", ru: "Сотрудник обновлён", tj: "Узви гурӯҳ нав шуд" } as T,
    memberDeleted: { en: "Team member deleted", ru: "Сотрудник удалён", tj: "Узви гурӯҳ ҳазф шуд" } as T,
    deleteMemberConfirm: {
      en: "Are you sure you want to delete this team member?",
      ru: "Вы уверены, что хотите удалить этого сотрудника?",
      tj: "Оё мехоҳед ин узвро ҳазф кунед?",
    } as T,
    loadingTeam: { en: "Loading team members...", ru: "Загрузка команды...", tj: "Бор кардани гурӯҳ..." } as T,

    // Partners
    addPartner: { en: "Add Partner", ru: "Добавить партнёра", tj: "Илова кардани шарик" } as T,
    editPartner: { en: "Edit Partner", ru: "Редактировать партнёра", tj: "Таҳрири шарик" } as T,
    createPartner: { en: "Create Partner", ru: "Создать партнёра", tj: "Сохтани шарик" } as T,
    updatePartner: { en: "Update Partner", ru: "Обновить партнёра", tj: "Нав кардани шарик" } as T,
    partnerCreated: { en: "Partner created successfully", ru: "Партнёр добавлен", tj: "Шарик илова шуд" } as T,
    partnerUpdated: { en: "Partner updated successfully", ru: "Партнёр обновлён", tj: "Шарик нав шуд" } as T,
    partnerDeleted: { en: "Partner deleted", ru: "Партнёр удалён", tj: "Шарик ҳазф шуд" } as T,
    deletePartnerConfirm: {
      en: "Are you sure you want to delete this partner?",
      ru: "Вы уверены, что хотите удалить этого партнёра?",
      tj: "Оё мехоҳед ин шарикро ҳазф кунед?",
    } as T,
    loadingPartners: { en: "Loading partners...", ru: "Загрузка партнёров...", tj: "Бор кардани шарикон..." } as T,
    partnerName: { en: "Partner Name", ru: "Название партнёра", tj: "Номи шарик" } as T,
    websiteUrl: { en: "Website URL", ru: "Ссылка на сайт", tj: "Пайванди сайт" } as T,
    websitePlaceholder: { en: "https://example.com", ru: "https://example.com", tj: "https://example.com" } as T,
    partnerLogo: { en: "Partner Logo", ru: "Логотип партнёра", tj: "Логотипи шарик" } as T,
    logoRequired: { en: "Logo is required", ru: "Загрузите логотип", tj: "Логотипро бор кунед" } as T,
    partnerNameRequired: { en: "Partner name is required", ru: "Введите название партнёра", tj: "Номи шарикро ворид кунед" } as T,

    // Services
    addService: { en: "Add Service", ru: "Добавить услугу", tj: "Илова кардани хидмат" } as T,
    editService: { en: "Edit Service", ru: "Редактировать услугу", tj: "Таҳрири хидмат" } as T,
    createService: { en: "Create Service", ru: "Создать услугу", tj: "Сохтани хидмат" } as T,
    updateService: { en: "Update Service", ru: "Обновить услугу", tj: "Нав кардани хидмат" } as T,
    serviceCreated: { en: "Service created successfully", ru: "Услуга создана", tj: "Хидмат сохта шуд" } as T,
    serviceUpdated: { en: "Service updated successfully", ru: "Услуга обновлена", tj: "Хидмат нав шуд" } as T,
    serviceDeleted: { en: "Service deleted", ru: "Услуга удалена", tj: "Хидмат ҳазф шуд" } as T,
    deleteServiceConfirm: {
      en: "Are you sure you want to delete this service?",
      ru: "Вы уверены, что хотите удалить эту услугу?",
      tj: "Оё мехоҳед ин хидматро ҳазф кунед?",
    } as T,
    loadingServices: { en: "Loading services...", ru: "Загрузка услуг...", tj: "Бор кардани хидматҳо..." } as T,
    serviceMedia: { en: "Service Media", ru: "Медиа услуги", tj: "Медиаи хидмат" } as T,
    serviceMediaHint: {
      en: "Upload an image, GIF, video (MP4/WebM/MOV) or Lottie JSON — max 100 MB",
      ru: "Загрузите изображение, GIF, видео (MP4/WebM/MOV) или Lottie JSON — до 100 МБ",
      tj: "Расм, GIF, видео (MP4/WebM/MOV) ё Lottie JSON — то 100 МБ",
    } as T,
    serviceTitleRequired: { en: "Title is required", ru: "Введите заголовок", tj: "Унвонро ворид кунед" } as T,
    serviceMediaRequired: { en: "Media file is required", ru: "Загрузите медиафайл", tj: "Медиафайлро бор кунед" } as T,
    subtitle: { en: "Subtitle (optional)", ru: "Подзаголовок (необязательно)", tj: "Зерунвон (ихтиёрӣ)" } as T,
    linkUrl: { en: "Link URL (optional)", ru: "Ссылка (необязательно)", tj: "Пайванд (ихтиёрӣ)" } as T,
    linkLabel: { en: "Button Label (optional)", ru: "Текст кнопки (необязательно)", tj: "Матни тугма (ихтиёрӣ)" } as T,
    moveUp: { en: "Move Up", ru: "Вверх", tj: "Боло" } as T,
    moveDown: { en: "Move Down", ru: "Вниз", tj: "Поён" } as T,
    activeLabel: { en: "Visible on website", ru: "Отображается на сайте", tj: "Дар сайт намоён аст" } as T,
    featuredLabel: { en: "Featured on homepage", ru: "На главной странице", tj: "Дар саҳифаи аввал" } as T,

    // Comics
    addComic: { en: "Add Comic", ru: "Добавить комикс", tj: "Комикс илова кунед" } as T,
    editComic: { en: "Edit Comic", ru: "Редактировать комикс", tj: "Вироиши комикс" } as T,
    comicCreated: { en: "Comic created", ru: "Комикс создан", tj: "Комикс сохта шуд" } as T,
    comicUpdated: { en: "Comic updated", ru: "Комикс обновлён", tj: "Комикс нав шуд" } as T,
    comicDeleted: { en: "Comic deleted", ru: "Комикс удалён", tj: "Комикс ҳазф шуд" } as T,
    deleteComicConfirm: { en: "Delete this comic?", ru: "Удалить этот комикс?", tj: "Ин комиксро ҳазф кунед?" } as T,
    loadingComics: { en: "Loading comics...", ru: "Загрузка комиксов...", tj: "Бор кардани комиксҳо..." } as T,
    coverImage: { en: "Cover Image", ru: "Обложка", tj: "Муқова" } as T,
    manageChapters: { en: "Manage Chapters", ru: "Управление главами", tj: "Идораи бобҳо" } as T,

    // Chapters
    addChapter: { en: "Add Chapter", ru: "Добавить главу", tj: "Боб илова кунед" } as T,
    chapterCreated: { en: "Chapter created", ru: "Глава создана", tj: "Боб сохта шуд" } as T,
    chapterUpdated: { en: "Chapter updated", ru: "Глава обновлена", tj: "Боб нав шуд" } as T,
    chapterDeleted: { en: "Chapter deleted", ru: "Глава удалена", tj: "Боб ҳазф шуд" } as T,
    deleteChapterConfirm: { en: "Delete this chapter and all its pages?", ru: "Удалить эту главу со всеми страницами?", tj: "Ин бобро бо ҳамаи саҳифаҳо ҳазф кунед?" } as T,

    // Pages
    uploadPages: { en: "Upload Pages", ru: "Загрузить страницы", tj: "Саҳифаҳо бор кунед" } as T,
    pageDeleted: { en: "Page deleted", ru: "Страница удалена", tj: "Саҳифа ҳазф шуд" } as T,

    // Categories
    categories: { en: "Categories", ru: "Категории", tj: "Категорияҳо" } as T,
    addCategory: { en: "Add Category", ru: "Добавить категорию", tj: "Категория илова кунед" } as T,
    editCategory: { en: "Edit Category", ru: "Редактировать категорию", tj: "Вироиш кардани категория" } as T,
    categorySlug: { en: "Slug (URL-friendly)", ru: "Слаг (для URL)", tj: "Слаг (барои URL)" } as T,
    categoryName: { en: "Category Name", ru: "Название категории", tj: "Номи категория" } as T,
    categoryCreated: { en: "Category created", ru: "Категория создана", tj: "Категория сохта шуд" } as T,
    categoryUpdated: { en: "Category updated", ru: "Категория обновлена", tj: "Категория нав шуд" } as T,
    categoryDeleted: { en: "Category deleted", ru: "Категория удалена", tj: "Категория ҳазф шуд" } as T,
    deleteCategoryConfirm: { en: "Delete this category?", ru: "Удалить эту категорию?", tj: "Ин категорияро ҳазф кунед?" } as T,
    assignCategories: { en: "Assign Categories", ru: "Назначить категории", tj: "Категорияҳоро таъин кунед" } as T,
    filterAll: { en: "All", ru: "Все", tj: "Ҳама" } as T,
    projectIsActive: { en: "Visible on website", ru: "Отображается на сайте", tj: "Дар сайт намоён аст" } as T,

    // About
    aboutSection: { en: "About Section", ru: "Раздел «О нас»", tj: "Бахши «Дар бораи мо»" } as T,
    aboutUpdated: { en: "About section updated successfully", ru: "Раздел «О нас» обновлён", tj: "Бахш нав шуд" } as T,
    loadingAbout: { en: "Loading about section...", ru: "Загрузка раздела...", tj: "Бор кардани бахш..." } as T,

    // Contacts
    contactInfo: { en: "Contact Information", ru: "Контактная информация", tj: "Маълумоти тамос" } as T,
    contactsUpdated: { en: "Contacts updated successfully", ru: "Контакты обновлены", tj: "Тамос нав шуд" } as T,
    loadingContacts: { en: "Loading contacts...", ru: "Загрузка контактов...", tj: "Бор кардани тамос..." } as T,
    sectionContent: { en: "Section Content", ru: "Содержание раздела", tj: "Мазмуни бахш" } as T,
    sectionLabel: { en: "Section Label", ru: "Метка раздела", tj: "Нишонаи бахш" } as T,
    sectionHeading: { en: "Section Heading", ru: "Заголовок раздела", tj: "Унвони бахш" } as T,
    sectionSubtext: { en: "Introductory Text", ru: "Вводный текст", tj: "Матни муқаддимавӣ" } as T,
    workingHours: { en: "Working Hours", ru: "Часы работы", tj: "Соатҳои корӣ" } as T,
    workingHoursPlaceholder: { en: "e.g. Mon–Fri: 9:00–18:00", ru: "напр. Пн–Пт: 9:00–18:00", tj: "м. Душ–Ҷум: 9:00–18:00" } as T,
    whatsappUrl: { en: "WhatsApp URL", ru: "Ссылка WhatsApp", tj: "Пайванди WhatsApp" } as T,
    whatsappPlaceholder: { en: "https://wa.me/992...", ru: "https://wa.me/992...", tj: "https://wa.me/992..." } as T,
    contactDetails: { en: "Contact Details", ru: "Контактные данные", tj: "Маълумоти тамос" } as T,
  },

  // --- Hero admin ---
  heroAdmin: {
    label: { en: "Hero Section", ru: "Секция Hero", tj: "Бахши Hero" } as T,
    heading: { en: "Hero", ru: "Hero", tj: "Hero" } as T,
    videoSection: { en: "Hero Video", ru: "Видео Hero", tj: "Видеои Hero" } as T,
    videoHint: {
      en: "Upload MP4, WebM or GIF — up to 100 MB. Plays autoplay looped in the background.",
      ru: "Загрузите MP4, WebM или GIF — до 100 МБ. Воспроизводится автоматически в фоне.",
      tj: "MP4, WebM ё GIF бор кунед — то 100 МБ. Ба таври автоматӣ дар замина пахш мешавад.",
    } as T,
    imageSection: { en: "Fallback Image", ru: "Запасное изображение", tj: "Расми захиравӣ" } as T,
    imageHint: {
      en: "Shown when video is not yet loaded or not set. JPG, PNG, WebP.",
      ru: "Показывается, если видео ещё не загружено или не задано. JPG, PNG, WebP.",
      tj: "Ҳангоме ки видео бор нашудааст нишон дода мешавад. JPG, PNG, WebP.",
    } as T,
    ctaSection: { en: "Call-to-Action Buttons", ru: "Кнопки призыва к действию", tj: "Тугмаҳои даъвати амал" } as T,
    ctaPrimaryLabel: { en: "Primary Button Label", ru: "Текст основной кнопки", tj: "Матни тугмаи асосӣ" } as T,
    ctaPrimaryHref: { en: "Primary Button Link", ru: "Ссылка основной кнопки", tj: "Пайванди тугмаи асосӣ" } as T,
    ctaSecondaryLabel: { en: "Secondary Button Label", ru: "Текст второй кнопки", tj: "Матни тугмаи дуюм" } as T,
    ctaSecondaryHref: { en: "Secondary Button Link", ru: "Ссылка второй кнопки", tj: "Пайванди тугмаи дуюм" } as T,
    effectsEnabled: { en: "Enable interactive effects", ru: "Включить интерактивные эффекты", tj: "Эффектҳои интерактивиро фаъол кунед" } as T,
    effectsHint: {
      en: "When on: video expands and parallax activates on hover. Disable for simpler experience.",
      ru: "Если включено: видео расширяется при наведении, параллакс активен. Отключите для упрощённого вида.",
      tj: "Ҳангоми фаъол: видео ҳангоми кашидани муш васеъ мешавад. Барои намои оддӣ хомӯш кунед.",
    } as T,
    uploadVideo: { en: "Upload Video", ru: "Загрузить видео", tj: "Видео бор кунед" } as T,
    uploadImage: { en: "Upload Image", ru: "Загрузить изображение", tj: "Расм бор кунед" } as T,
    replaceVideo: { en: "Replace Video", ru: "Заменить видео", tj: "Видеоро иваз кунед" } as T,
    replaceImage: { en: "Replace Image", ru: "Заменить изображение", tj: "Расмро иваз кунед" } as T,
    videoUploaded: { en: "Hero video uploaded", ru: "Видео Hero загружено", tj: "Видеои Hero бор шуд" } as T,
    imageUploaded: { en: "Fallback image uploaded", ru: "Запасное изображение загружено", tj: "Расми захиравӣ бор шуд" } as T,
    heroUpdated: { en: "Hero section updated", ru: "Секция Hero обновлена", tj: "Бахши Hero нав шуд" } as T,
    titleSection: { en: "Headline Text", ru: "Текст заголовка", tj: "Матни унвон" } as T,
    titleEn: { en: "Title (EN)", ru: "Заголовок (EN)", tj: "Унвон (EN)" } as T,
    subtitleEn: { en: "Subtitle (EN)", ru: "Подзаголовок (EN)", tj: "Зерунвон (EN)" } as T,
  },

  // --- Services full page ---
  servicesPage: {
    label: { en: "All Services", ru: "Все услуги", tj: "Ҳамаи хидматҳо" } as T,
    heading: { en: "Our Services", ru: "Наши услуги", tj: "Хидматҳои мо" } as T,
    viewAll: { en: "View All Services", ru: "Все услуги", tj: "Ҳамаи хидматҳо" } as T,
    backToHome: { en: "Back to Home", ru: "На главную", tj: "Ба саҳифаи аввал" } as T,
  },

  // --- Lang label tabs ---
  langLabels: {
    en: { en: "EN", ru: "EN", tj: "EN" } as T,
    ru: { en: "RU", ru: "RU", tj: "RU" } as T,
    tj: { en: "TJ", ru: "TJ", tj: "TJ" } as T,
    english: { en: "English", ru: "Английский", tj: "Англисӣ" } as T,
    russian: { en: "Russian", ru: "Русский", tj: "Русӣ" } as T,
    tajik: { en: "Tajik", ru: "Таджикский", tj: "Тоҷикӣ" } as T,
  },

  // --- Not found page ---
  notFound: {
    title: { en: "404 — Page Not Found", ru: "404 — Страница не найдена", tj: "404 — Саҳифа ёфт нашуд" } as T,
    description: {
      en: "The page you are looking for doesn't exist.",
      ru: "Страница, которую вы ищете, не существует.",
      tj: "Саҳифае, ки шумо меҷӯед, вуҷуд надорад.",
    } as T,
  },
};
