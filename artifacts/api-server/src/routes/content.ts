import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, aboutTable, contactsTable } from "@workspace/db";
import {
  UpdateAboutBody,
  UpdateAboutResponse,
  GetAboutResponse,
  UpdateContactsBody,
  UpdateContactsResponse,
  GetContactsResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

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
    res.json(GetAboutResponse.parse(created));
    return;
  }
  res.json(GetAboutResponse.parse(about));
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
    res.json(UpdateAboutResponse.parse(created));
    return;
  }
  const [updated] = await db
    .update(aboutTable)
    .set(parsed.data)
    .where(sql`${aboutTable.id} = ${existing.id}`)
    .returning();
  res.json(UpdateAboutResponse.parse(updated ?? existing));
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
    res.json(GetContactsResponse.parse(created));
    return;
  }
  res.json(GetContactsResponse.parse(contacts));
});

router.patch("/contacts", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateContactsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(contactsTable).limit(1);
  if (!existing) {
    const values: Record<string, unknown> = { ...parsed.data };
    if (!values.email) values.email = "info@tasvirnigor.tj";
    const [created] = await db.insert(contactsTable).values(values as any).returning();
    res.json(UpdateContactsResponse.parse(created));
    return;
  }
  const [updated] = await db
    .update(contactsTable)
    .set(parsed.data)
    .where(sql`${contactsTable.id} = ${existing.id}`)
    .returning();
  res.json(UpdateContactsResponse.parse(updated ?? existing));
});

export default router;
