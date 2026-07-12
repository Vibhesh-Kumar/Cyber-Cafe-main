import { Router, type IRouter } from "express";
import { and, eq, ilike } from "drizzle-orm";
import { db, servicesTable, categoriesTable } from "@workspace/db";
import {
  CreateServiceBody,
  UpdateServiceBody,
  ListServicesQueryParams,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

function toApiService(
  row: typeof servicesTable.$inferSelect,
  category: typeof categoriesTable.$inferSelect,
) {
  return {
    id: row.id,
    categoryId: row.categoryId,
    categorySlug: category.slug,
    categoryName: category.name,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    estimatedDays: row.estimatedDays,
    formSchema: row.formSchema,
    requiredDocuments: row.requiredDocuments,
    isActive: row.isActive,
    createdAt: row.createdAt,
  };
}

router.get("/services", async (req, res): Promise<void> => {
  const params = ListServicesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(servicesTable)
    .innerJoin(categoriesTable, eq(servicesTable.categoryId, categoriesTable.id))
    .where(
      and(
        params.data.categorySlug
          ? eq(categoriesTable.slug, params.data.categorySlug)
          : undefined,
        params.data.search
          ? ilike(servicesTable.name, `%${params.data.search}%`)
          : undefined,
      ),
    );

  res.json(rows.map((r) => toApiService(r.services, r.categories)));
});

router.post(
  "/services",
  requireAuth,
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const parsed = CreateServiceBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const slug = parsed.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const [created] = await db
      .insert(servicesTable)
      .values({ ...parsed.data, slug, price: String(parsed.data.price) })
      .returning();

    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, created.categoryId));

    res.status(201).json(toApiService(created, category));
  },
);

router.get("/services/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const rows = await db
    .select()
    .from(servicesTable)
    .innerJoin(categoriesTable, eq(servicesTable.categoryId, categoriesTable.id))
    .where(eq(servicesTable.id, id));

  if (rows.length === 0) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  res.json(toApiService(rows[0].services, rows[0].categories));
});

router.patch(
  "/services/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const parsed = UpdateServiceBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { price, ...rest } = parsed.data;

    const [updated] = await db
      .update(servicesTable)
      .set({ ...rest, ...(price !== undefined ? { price: String(price) } : {}) })
      .where(eq(servicesTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, updated.categoryId));

    res.json(toApiService(updated, category));
  },
);

router.delete(
  "/services/:id",
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
      .delete(servicesTable)
      .where(eq(servicesTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
