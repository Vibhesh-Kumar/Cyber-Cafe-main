import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, blogsTable } from "@workspace/db";
import { CreateBlogBody, UpdateBlogBody } from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

router.get("/blogs", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(blogsTable)
    .orderBy(desc(blogsTable.publishedAt));
  res.json(rows);
});

router.post(
  "/blogs",
  requireAuth,
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const parsed = CreateBlogBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [created] = await db
      .insert(blogsTable)
      .values({ ...parsed.data, slug: slugify(parsed.data.title) })
      .returning();

    res.status(201).json(created);
  },
);

router.get("/blogs/:slug", async (req, res): Promise<void> => {
  const slug = Array.isArray(req.params.slug)
    ? req.params.slug[0]
    : req.params.slug;

  const [row] = await db
    .select()
    .from(blogsTable)
    .where(eq(blogsTable.slug, slug));

  if (!row) {
    res.status(404).json({ error: "Blog not found" });
    return;
  }

  res.json(row);
});

router.patch(
  "/blogs/id/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const parsed = UpdateBlogBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { title, ...rest } = parsed.data;

    const [updated] = await db
      .update(blogsTable)
      .set({
        ...rest,
        ...(title !== undefined ? { title, slug: slugify(title) } : {}),
      })
      .where(eq(blogsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Blog not found" });
      return;
    }

    res.json(updated);
  },
);

router.delete(
  "/blogs/id/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [deleted] = await db
      .delete(blogsTable)
      .where(eq(blogsTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Blog not found" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
