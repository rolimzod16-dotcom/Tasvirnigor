import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, servicesTable } from "@workspace/db";
import {
  CreateServiceBody,
  UpdateServiceParams,
  UpdateServiceBody,
  DeleteServiceParams,
  ListServicesResponse,
  UpdateServiceResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import { serialize } from "../lib/serialize";

const router: IRouter = Router();

router.get("/services", async (req, res): Promise<void> => {
  const services = await db
    .select()
    .from(servicesTable)
    .orderBy(asc(servicesTable.sortOrder), asc(servicesTable.createdAt));
  res.json(ListServicesResponse.parse(serialize(services)));
});

router.post("/services", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid service body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [service] = await db.insert(servicesTable).values(parsed.data).returning();
  res.status(201).json(UpdateServiceResponse.parse(serialize(service)));
});

router.patch("/services/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [service] = await db
    .update(servicesTable)
    .set(parsed.data)
    .where(eq(servicesTable.id, params.data.id))
    .returning();
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.json(UpdateServiceResponse.parse(serialize(service)));
});

router.delete("/services/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(servicesTable)
    .where(eq(servicesTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
