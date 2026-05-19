import { db, categoriesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const CATEGORIES = [
  { slug: "3d-animation",      name: "3D Animation",     nameRu: "3D Анимация",            nameTj: "Анимацияи 3D",          sortOrder: 0 },
  { slug: "2d-animation",      name: "2D Animation",     nameRu: "2D Анимация",            nameTj: "Анимацияи 2D",          sortOrder: 1 },
  { slug: "comics",            name: "Comics",           nameRu: "Комиксы",                nameTj: "Комикс",                sortOrder: 2 },
  { slug: "films",             name: "Films",            nameRu: "Фильмы",                 nameTj: "Филмҳо",                sortOrder: 3 },
  { slug: "motion-design",     name: "Motion Design",    nameRu: "Моушн-дизайн",           nameTj: "Мошн-дизайн",          sortOrder: 4 },
  { slug: "cgi",               name: "CGI",              nameRu: "CGI",                    nameTj: "CGI",                   sortOrder: 5 },
  { slug: "vfx",               name: "VFX",              nameRu: "VFX",                    nameTj: "VFX",                   sortOrder: 6 },
  { slug: "character-design",  name: "Character Design", nameRu: "Дизайн персонажей",      nameTj: "Тарроҳии қаҳрамонон",  sortOrder: 7 },
  { slug: "storyboard",        name: "Storyboard",       nameRu: "Раскадровка",            nameTj: "Сторибоард",            sortOrder: 8 },
  { slug: "illustration",      name: "Illustration",     nameRu: "Иллюстрация",            nameTj: "Тасвирсозӣ",           sortOrder: 9 },
  { slug: "branding",          name: "Branding",         nameRu: "Брендинг",               nameTj: "Брендинг",             sortOrder: 10 },
  { slug: "video-editing",     name: "Video Editing",    nameRu: "Монтаж видео",           nameTj: "Монтажи видео",        sortOrder: 11 },
];

async function seed() {
  console.log("Seeding categories…");
  for (const cat of CATEGORIES) {
    await db
      .insert(categoriesTable)
      .values(cat)
      .onConflictDoUpdate({
        target: categoriesTable.slug,
        set: {
          name: cat.name,
          nameRu: cat.nameRu,
          nameTj: cat.nameTj,
          sortOrder: cat.sortOrder,
        },
      });
    console.log(`  ✓ ${cat.name}`);
  }
  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
