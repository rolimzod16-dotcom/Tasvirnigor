import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, aboutTable, contactsTable, heroTable } from "@workspace/db";
import {
  UpdateAboutBody,
  UpdateAboutResponse,
  GetAboutResponse,
  UpdateContactsBody,
  UpdateContactsResponse,
  GetContactsResponse,
  UpdateHeroBody,
  UpdateHeroResponse,
  GetHeroResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import { serialize } from "../lib/serialize";

const router: IRouter = Router();

router.get("/about", async (req, res): Promise<void> => {
  const [about] = await db.select().from(aboutTable).limit(1);
  if (!about) {
    const [created] = await db.insert(aboutTable).values({
      headline: "Tasvirnigor Film & Animation Studio",
      body: "A professional film and animation studio based in Tajikistan, creating compelling visual stories that resonate with audiences worldwide.",
      mission: "To tell authentic Central Asian stories through the art of cinema and animation.",
      founded: "2015",
    }).returning();
    res.json(GetAboutResponse.parse(serialize(created)));
    return;
  }
  res.json(GetAboutResponse.parse(serialize(about)));
});

router.patch("/about", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAboutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(aboutTable).limit(1);
  if (!existing) {
    const [created] = await db.insert(aboutTable).values({
      headline: parsed.data.headline ?? "Tasvirnigor Film & Animation Studio",
      body: parsed.data.body ?? "",
      mission: parsed.data.mission ?? null,
      founded: parsed.data.founded ?? null,
    }).returning();
    res.json(UpdateAboutResponse.parse(serialize(created)));
    return;
  }
  const [updated] = await db
    .update(aboutTable)
    .set(parsed.data)
    .where(sql`${aboutTable.id} = ${existing.id}`)
    .returning();
  res.json(UpdateAboutResponse.parse(serialize(updated ?? existing)));
});

router.get("/contacts", async (req, res): Promise<void> => {
  const [contacts] = await db.select().from(contactsTable).limit(1);
  if (!contacts) {
    const [created] = await db.insert(contactsTable).values({
      email: "info@tasvirnigor.tj",
      phone: null,
      address: "Dushanbe, Tajikistan",
      telegram: null,
      instagram: null,
      youtube: null,
      facebook: null,
    }).returning();
    res.json(GetContactsResponse.parse(serialize(created)));
    return;
  }
  res.json(GetContactsResponse.parse(serialize(contacts)));
});

/** Coerce empty strings to null so the DB never stores blank social links. */
function nullifyEmpty<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }
  return result as T;
}

router.patch("/contacts", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateContactsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const clean = nullifyEmpty(parsed.data as Record<string, unknown>);
  const [existing] = await db.select().from(contactsTable).limit(1);
  if (!existing) {
    const values: Record<string, unknown> = { ...clean };
    if (!values.email) values.email = "info@tasvirnigor.tj";
    const [created] = await db.insert(contactsTable).values(values as any).returning();
    res.json(UpdateContactsResponse.parse(serialize(created)));
    return;
  }
  const [updated] = await db
    .update(contactsTable)
    .set(clean as any)
    .where(sql`${contactsTable.id} = ${existing.id}`)
    .returning();
  res.json(UpdateContactsResponse.parse(serialize(updated ?? existing)));
});

router.get("/hero", async (req, res): Promise<void> => {
  const [hero] = await db.select().from(heroTable).limit(1);
  if (!hero) {
    const [created] = await db.insert(heroTable).values({
      titleEn: "Film & Animation from Tajikistan",
      effectsEnabled: true,
    }).returning();
    res.json(GetHeroResponse.parse(serialize(created)));
    return;
  }
  res.json(GetHeroResponse.parse(serialize(hero)));
});

router.patch("/hero", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateHeroBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(heroTable).limit(1);
  if (!existing) {
    const [created] = await db.insert(heroTable).values({
      titleEn: parsed.data.titleEn ?? "Film & Animation from Tajikistan",
      effectsEnabled: parsed.data.effectsEnabled ?? true,
      ...parsed.data,
    }).returning();
    res.json(UpdateHeroResponse.parse(serialize(created)));
    return;
  }
  const [updated] = await db
    .update(heroTable)
    .set(parsed.data)
    .where(sql`${heroTable.id} = ${existing.id}`)
    .returning();
  res.json(UpdateHeroResponse.parse(serialize(updated ?? existing)));
});

export default router;
