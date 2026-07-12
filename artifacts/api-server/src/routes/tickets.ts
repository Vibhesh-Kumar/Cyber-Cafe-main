import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, ticketsTable } from "@workspace/db";
import { CreateTicketBody, UpdateTicketBody } from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/tickets", requireAuth, async (req, res): Promise<void> => {
  const isStaff = req.dbUser!.role === "operator" || req.dbUser!.role === "admin";

  const rows = isStaff
    ? await db.select().from(ticketsTable).orderBy(desc(ticketsTable.createdAt))
    : await db
        .select()
        .from(ticketsTable)
        .where(eq(ticketsTable.userId, req.dbUser!.id))
        .orderBy(desc(ticketsTable.createdAt));

  res.json(rows);
});

router.post("/tickets", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [created] = await db
    .insert(ticketsTable)
    .values({ ...parsed.data, userId: req.dbUser!.id })
    .returning();

  res.status(201).json(created);
});

router.patch(
  "/tickets/:id",
  requireAuth,
  requireRole("operator", "admin"),
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const parsed = UpdateTicketBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [updated] = await db
      .update(ticketsTable)
      .set(parsed.data)
      .where(eq(ticketsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    res.json(updated);
  },
);

export default router;
