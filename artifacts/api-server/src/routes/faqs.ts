import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, faqsTable } from "@workspace/db";
import { CreateFaqBody, UpdateFaqBody } from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/faqs", async (_req, res): Promise<void> => {
  const rows = await db.select().from(faqsTable);
  res.json(rows);
});

router.post(
  "/faqs",
  requireAuth,
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const parsed = CreateFaqBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [created] = await db.insert(faqsTable).values(parsed.data).returning();
    res.status(201).json(created);
  },
);

router.patch(
  "/faqs/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const parsed = UpdateFaqBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [updated] = await db
      .update(faqsTable)
      .set(parsed.data)
      .where(eq(faqsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Faq not found" });
      return;
    }

    res.json(updated);
  },
);

router.delete(
  "/faqs/:id",
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
      .delete(faqsTable)
      .where(eq(faqsTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Faq not found" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
