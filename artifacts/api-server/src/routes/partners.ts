import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, partnersTable } from "@workspace/db";
import {
  CreatePartnerBody,
  UpdatePartnerParams,
  UpdatePartnerBody,
  DeletePartnerParams,
  ListPartnersResponse,
  UpdatePartnerResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import { serialize } from "../lib/serialize";

const router: IRouter = Router();

router.get("/partners", async (req, res): Promise<void> => {
  const partners = await db
    .select()
    .from(partnersTable)
    .orderBy(asc(partnersTable.sortOrder), asc(partnersTable.createdAt));
  res.json(ListPartnersResponse.parse(serialize(partners)));
});

router.post("/partners", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreatePartnerBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid partner body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [partner] = await db.insert(partnersTable).values(parsed.data).returning();
  res.status(201).json(UpdatePartnerResponse.parse(serialize(partner)));
});

router.patch("/partners/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdatePartnerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePartnerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [partner] = await db
    .update(partnersTable)
    .set(parsed.data)
    .where(eq(partnersTable.id, params.data.id))
    .returning();
  if (!partner) {
    res.status(404).json({ error: "Partner not found" });
    return;
  }
  res.json(UpdatePartnerResponse.parse(serialize(partner)));
});

router.delete("/partners/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeletePartnerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(partnersTable)
    .where(eq(partnersTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Partner not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
