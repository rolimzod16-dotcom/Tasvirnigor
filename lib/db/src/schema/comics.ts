import { pgTable, text, serial, timestamp, integer, boolean, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const comicsTable = pgTable("comics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleRu: text("title_ru"),
  titleTj: text("title_tj"),
  description: text("description"),
  descriptionRu: text("description_ru"),
  descriptionTj: text("description_tj"),
  coverUrl: text("cover_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const comicCategoriesTable = pgTable(
  "comic_categories",
  {
    comicId: integer("comic_id")
      .notNull()
      .references(() => comicsTable.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.comicId, t.categoryId] })]
);

export const chaptersTable = pgTable("chapters", {
  id: serial("id").primaryKey(),
  comicId: integer("comic_id")
    .notNull()
    .references(() => comicsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  titleRu: text("title_ru"),
  titleTj: text("title_tj"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const comicPagesTable = pgTable("comic_pages", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id")
    .notNull()
    .references(() => chaptersTable.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertComicSchema = createInsertSchema(comicsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChapterSchema = createInsertSchema(chaptersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertComicPageSchema = createInsertSchema(comicPagesTable).omit({ id: true, createdAt: true });

export type InsertComic = z.infer<typeof insertComicSchema>;
export type Comic = typeof comicsTable.$inferSelect;
export type Chapter = typeof chaptersTable.$inferSelect;
export type ComicPage = typeof comicPagesTable.$inferSelect;
