import { Router, type IRouter } from "express";
import { eq, asc, inArray } from "drizzle-orm";
import { db, projectsTable, categoriesTable, projectCategoriesTable } from "@workspace/db";
import {
  CreateProjectBody,
  UpdateProjectParams,
  UpdateProjectBody,
  DeleteProjectParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import { serialize } from "../lib/serialize";

const router: IRouter = Router();

// ── Helper: fetch categories for an array of project ids ──────────────────────

async function loadCategoriesForProjects(projectIds: number[]) {
  if (projectIds.length === 0) return new Map<number, object[]>();

  const rows = await db
    .select({
      projectId: projectCategoriesTable.projectId,
      id: categoriesTable.id,
      slug: categoriesTable.slug,
      name: categoriesTable.name,
      nameRu: categoriesTable.nameRu,
      nameTj: categoriesTable.nameTj,
      sortOrder: categoriesTable.sortOrder,
      createdAt: categoriesTable.createdAt,
    })
    .from(projectCategoriesTable)
    .innerJoin(categoriesTable, eq(projectCategoriesTable.categoryId, categoriesTable.id))
    .where(inArray(projectCategoriesTable.projectId, projectIds));

  const map = new Map<number, object[]>();
  for (const row of rows) {
    const { projectId, ...cat } = row;
    if (!map.has(projectId)) map.set(projectId, []);
    map.get(projectId)!.push(serialize(cat));
  }
  return map;
}

// ── Helper: sync category assignments for a project ───────────────────────────

async function syncCategories(projectId: number, categoryIds: number[] | null | undefined) {
  await db.delete(projectCategoriesTable).where(eq(projectCategoriesTable.projectId, projectId));
  if (categoryIds && categoryIds.length > 0) {
    await db.insert(projectCategoriesTable).values(
      categoryIds.map((cid) => ({ projectId, categoryId: cid }))
    );
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

router.get("/projects", async (req, res): Promise<void> => {
  const projects = await db
    .select()
    .from(projectsTable)
    .orderBy(asc(projectsTable.sortOrder), asc(projectsTable.createdAt));

  const ids = projects.map((p) => p.id);
  const catsByProject = await loadCategoriesForProjects(ids);

  res.json(
    projects.map((p) => ({
      ...serialize(p),
      categories: catsByProject.get(p.id) ?? [],
    }))
  );
});

router.post("/projects", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid project body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { categoryIds, ...projectData } = parsed.data as typeof parsed.data & { categoryIds?: number[] };

  const [project] = await db.insert(projectsTable).values(projectData).returning();
  await syncCategories(project.id, categoryIds);

  const catsByProject = await loadCategoriesForProjects([project.id]);
  res.status(201).json({
    ...serialize(project),
    categories: catsByProject.get(project.id) ?? [],
  });
});

router.patch("/projects/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { categoryIds, ...projectData } = parsed.data as typeof parsed.data & { categoryIds?: number[] };

  const [project] = await db
    .update(projectsTable)
    .set(projectData)
    .where(eq(projectsTable.id, params.data.id))
    .returning();

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (categoryIds !== undefined) {
    await syncCategories(project.id, categoryIds);
  }

  const catsByProject = await loadCategoriesForProjects([project.id]);
  res.json({
    ...serialize(project),
    categories: catsByProject.get(project.id) ?? [],
  });
});

router.delete("/projects/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(projectsTable)
    .where(eq(projectsTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
