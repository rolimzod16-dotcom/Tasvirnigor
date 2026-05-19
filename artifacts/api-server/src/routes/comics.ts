import { Router, type IRouter } from "express";
import { eq, asc, inArray, sql } from "drizzle-orm";
import {
  db,
  comicsTable,
  chaptersTable,
  comicPagesTable,
  comicCategoriesTable,
  categoriesTable,
} from "@workspace/db";
import {
  CreateComicBody,
  UpdateComicParams,
  UpdateComicBody,
  DeleteComicParams,
  GetComicParams,
  ListChaptersParams,
  CreateChapterParams,
  CreateChapterBody,
  GetChapterParams,
  UpdateChapterParams,
  UpdateChapterBody,
  DeleteChapterParams,
  AddPagesParams,
  AddPagesBody,
  DeletePageParams,
  ReorderPagesBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import { serialize } from "../lib/serialize";

const router: IRouter = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

async function loadCategoriesForComics(comicIds: number[]) {
  if (comicIds.length === 0) return new Map<number, object[]>();
  const rows = await db
    .select({
      comicId: comicCategoriesTable.comicId,
      id: categoriesTable.id,
      slug: categoriesTable.slug,
      name: categoriesTable.name,
      nameRu: categoriesTable.nameRu,
      nameTj: categoriesTable.nameTj,
      sortOrder: categoriesTable.sortOrder,
      createdAt: categoriesTable.createdAt,
    })
    .from(comicCategoriesTable)
    .innerJoin(categoriesTable, eq(comicCategoriesTable.categoryId, categoriesTable.id))
    .where(inArray(comicCategoriesTable.comicId, comicIds));

  const map = new Map<number, object[]>();
  for (const row of rows) {
    const { comicId, ...cat } = row;
    if (!map.has(comicId)) map.set(comicId, []);
    map.get(comicId)!.push(serialize(cat));
  }
  return map;
}

async function syncComicCategories(comicId: number, categoryIds: number[] | null | undefined) {
  await db.delete(comicCategoriesTable).where(eq(comicCategoriesTable.comicId, comicId));
  if (categoryIds && categoryIds.length > 0) {
    await db.insert(comicCategoriesTable).values(
      categoryIds.map((cid) => ({ comicId, categoryId: cid }))
    );
  }
}

async function getChapterCounts(comicIds: number[]): Promise<Map<number, number>> {
  if (comicIds.length === 0) return new Map();
  const rows = await db
    .select({
      comicId: chaptersTable.comicId,
      count: sql<number>`count(*)::int`,
    })
    .from(chaptersTable)
    .where(inArray(chaptersTable.comicId, comicIds))
    .groupBy(chaptersTable.comicId);
  return new Map(rows.map((r) => [r.comicId, r.count]));
}

function attachCounts<T extends { id: number }>(
  items: T[],
  cats: Map<number, object[]>,
  counts: Map<number, number>
): object[] {
  return items.map((item) => ({
    ...serialize(item),
    categories: cats.get(item.id) ?? [],
    chapterCount: counts.get(item.id) ?? 0,
  }));
}

// ── Comics ────────────────────────────────────────────────────────────────────

router.get("/comics", async (req, res): Promise<void> => {
  const comics = await db
    .select()
    .from(comicsTable)
    .orderBy(asc(comicsTable.sortOrder), asc(comicsTable.id));

  const ids = comics.map((c) => c.id);
  const [cats, counts] = await Promise.all([
    loadCategoriesForComics(ids),
    getChapterCounts(ids),
  ]);
  res.json(attachCounts(comics, cats, counts));
});

router.post("/comics", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateComicBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { categoryIds, ...data } = parsed.data as typeof parsed.data & { categoryIds?: number[] };
  const [comic] = await db.insert(comicsTable).values(data).returning();
  await syncComicCategories(comic.id, categoryIds);
  const [cats, counts] = await Promise.all([
    loadCategoriesForComics([comic.id]),
    getChapterCounts([comic.id]),
  ]);
  res.status(201).json(attachCounts([comic], cats, counts)[0]);
});

router.get("/comics/:id", async (req, res): Promise<void> => {
  const params = GetComicParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [comic] = await db.select().from(comicsTable).where(eq(comicsTable.id, params.data.id));
  if (!comic) { res.status(404).json({ error: "Not found" }); return; }

  const chapters = await db
    .select()
    .from(chaptersTable)
    .where(eq(chaptersTable.comicId, comic.id))
    .orderBy(asc(chaptersTable.sortOrder), asc(chaptersTable.id));

  const [cats, counts] = await Promise.all([
    loadCategoriesForComics([comic.id]),
    getChapterCounts([comic.id]),
  ]);

  res.json({
    ...serialize(comic),
    categories: cats.get(comic.id) ?? [],
    chapterCount: counts.get(comic.id) ?? 0,
    chapters: chapters.map((ch) => serialize(ch)),
  });
});

router.patch("/comics/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateComicParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateComicBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { categoryIds, ...data } = parsed.data as typeof parsed.data & { categoryIds?: number[] };
  const [comic] = await db
    .update(comicsTable)
    .set(data)
    .where(eq(comicsTable.id, params.data.id))
    .returning();
  if (!comic) { res.status(404).json({ error: "Not found" }); return; }

  if (categoryIds !== undefined) await syncComicCategories(comic.id, categoryIds);

  const [cats, counts] = await Promise.all([
    loadCategoriesForComics([comic.id]),
    getChapterCounts([comic.id]),
  ]);
  res.json(attachCounts([comic], cats, counts)[0]);
});

router.delete("/comics/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteComicParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [deleted] = await db.delete(comicsTable).where(eq(comicsTable.id, params.data.id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

// ── Chapters ──────────────────────────────────────────────────────────────────

router.get("/comics/:id/chapters", async (req, res): Promise<void> => {
  const params = ListChaptersParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const chapters = await db
    .select()
    .from(chaptersTable)
    .where(eq(chaptersTable.comicId, params.data.id))
    .orderBy(asc(chaptersTable.sortOrder), asc(chaptersTable.id));
  res.json(chapters.map(serialize));
});

router.post("/comics/:id/chapters", requireAdmin, async (req, res): Promise<void> => {
  const params = CreateChapterParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = CreateChapterBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [chapter] = await db
    .insert(chaptersTable)
    .values({ ...parsed.data, comicId: params.data.id })
    .returning();
  res.status(201).json(serialize(chapter));
});

router.get("/chapters/:id", async (req, res): Promise<void> => {
  const params = GetChapterParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [chapter] = await db.select().from(chaptersTable).where(eq(chaptersTable.id, params.data.id));
  if (!chapter) { res.status(404).json({ error: "Not found" }); return; }
  const pages = await db
    .select()
    .from(comicPagesTable)
    .where(eq(comicPagesTable.chapterId, chapter.id))
    .orderBy(asc(comicPagesTable.sortOrder), asc(comicPagesTable.id));
  res.json({ ...serialize(chapter), pages: pages.map(serialize) });
});

router.patch("/chapters/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateChapterParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateChapterBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [chapter] = await db
    .update(chaptersTable)
    .set(parsed.data)
    .where(eq(chaptersTable.id, params.data.id))
    .returning();
  if (!chapter) { res.status(404).json({ error: "Not found" }); return; }
  res.json(serialize(chapter));
});

router.delete("/chapters/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteChapterParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [deleted] = await db.delete(chaptersTable).where(eq(chaptersTable.id, params.data.id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

// ── Pages ─────────────────────────────────────────────────────────────────────

router.post("/chapters/:id/pages", requireAdmin, async (req, res): Promise<void> => {
  const params = AddPagesParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = AddPagesBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const inserted = await db
    .insert(comicPagesTable)
    .values(
      parsed.data.pages.map((p) => ({
        chapterId: params.data.id,
        imageUrl: p.imageUrl,
        sortOrder: p.sortOrder,
      }))
    )
    .returning();
  res.status(201).json(inserted.map(serialize));
});

router.delete("/pages/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeletePageParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(comicPagesTable).where(eq(comicPagesTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/pages/reorder", requireAdmin, async (req, res): Promise<void> => {
  const parsed = ReorderPagesBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await Promise.all(
    parsed.data.pages.map((p) =>
      db.update(comicPagesTable).set({ sortOrder: p.sortOrder }).where(eq(comicPagesTable.id, p.id))
    )
  );
  res.sendStatus(204);
});

export default router;
