import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type ProjectMediaItem = {
  url: string;
  mimeType: string;
  name: string;
  sortOrder: number;
};

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleRu: text("title_ru"),
  titleTj: text("title_tj"),
  description: text("description"),
  descriptionRu: text("description_ru"),
  descriptionTj: text("description_tj"),
  youtubeUrl: text("youtube_url"),
  bannerUrl: text("banner_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  mediaItems: jsonb("media_items").$type<ProjectMediaItem[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
