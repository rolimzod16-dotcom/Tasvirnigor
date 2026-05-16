import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
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

export const contactsTable = pgTable("contacts", {
  id: serial("id").primaryKey(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  telegram: text("telegram"),
  instagram: text("instagram"),
  youtube: text("youtube"),
  facebook: text("facebook"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertContactsSchema = createInsertSchema(contactsTable).omit({ id: true, updatedAt: true });
export type InsertContacts = z.infer<typeof insertContactsSchema>;
export type Contacts = typeof contactsTable.$inferSelect;
