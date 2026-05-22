import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aboutTable = pgTable("about", {
  id: serial("id").primaryKey(),
  headline: text("headline").notNull(),
  headlineRu: text("headline_ru"),
  headlineTj: text("headline_tj"),
  body: text("body").notNull(),
  bodyRu: text("body_ru"),
  bodyTj: text("body_tj"),
  mission: text("mission"),
  missionRu: text("mission_ru"),
  missionTj: text("mission_tj"),
  founded: text("founded"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAboutSchema = createInsertSchema(aboutTable).omit({ id: true, updatedAt: true });
export type InsertAbout = z.infer<typeof insertAboutSchema>;
export type About = typeof aboutTable.$inferSelect;

export const heroTable = pgTable("hero", {
  id: serial("id").primaryKey(),
  videoUrl: text("video_url"),
  fallbackImageUrl: text("fallback_image_url"),
  titleEn: text("title_en").notNull().default("Film & Animation from Tajikistan"),
  titleRu: text("title_ru"),
  titleTj: text("title_tj"),
  subtitleEn: text("subtitle_en"),
  subtitleRu: text("subtitle_ru"),
  subtitleTj: text("subtitle_tj"),
  ctaPrimaryLabel: text("cta_primary_label"),
  ctaPrimaryLabelRu: text("cta_primary_label_ru"),
  ctaPrimaryLabelTj: text("cta_primary_label_tj"),
  ctaPrimaryHref: text("cta_primary_href"),
  ctaSecondaryLabel: text("cta_secondary_label"),
  ctaSecondaryLabelRu: text("cta_secondary_label_ru"),
  ctaSecondaryLabelTj: text("cta_secondary_label_tj"),
  ctaSecondaryHref: text("cta_secondary_href"),
  effectsEnabled: boolean("effects_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertHeroSchema = createInsertSchema(heroTable).omit({ id: true, updatedAt: true });
export type InsertHero = z.infer<typeof insertHeroSchema>;
export type Hero = typeof heroTable.$inferSelect;

export const contactsTable = pgTable("contacts", {
  id: serial("id").primaryKey(),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  addressRu: text("address_ru"),
  addressTj: text("address_tj"),
  workingHoursEn: text("working_hours_en"),
  workingHoursRu: text("working_hours_ru"),
  workingHoursTj: text("working_hours_tj"),
  labelEn: text("label_en"),
  labelRu: text("label_ru"),
  labelTj: text("label_tj"),
  headingEn: text("heading_en"),
  headingRu: text("heading_ru"),
  headingTj: text("heading_tj"),
  subtextEn: text("subtext_en"),
  subtextRu: text("subtext_ru"),
  subtextTj: text("subtext_tj"),
  telegram: text("telegram"),
  instagram: text("instagram"),
  youtube: text("youtube"),
  facebook: text("facebook"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertContactsSchema = createInsertSchema(contactsTable).omit({ id: true, updatedAt: true });
export type InsertContacts = z.infer<typeof insertContactsSchema>;
export type Contacts = typeof contactsTable.$inferSelect;
