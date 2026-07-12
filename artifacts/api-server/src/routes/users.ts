import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  UpdateMeBody,
  UpdateUserRoleBody,
  ListUsersQueryParams,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/users/me", requireAuth, async (req, res): Promise<void> => {
  res.json(req.dbUser);
});

router.patch("/users/me", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, req.dbUser!.id))
    .returning();

  res.json(updated);
});

router.get(
  "/users",
  requireAuth,
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const params = ListUsersQueryParams.safeParse(req.query);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const users = params.data.role
      ? await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.role, params.data.role))
      : await db.select().from(usersTable);

    res.json(users);
  },
);

router.patch(
  "/users/:id/role",
  requireAuth,
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const parsed = UpdateUserRoleBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const [updated] = await db
      .update(usersTable)
      .set({ role: parsed.data.role })
      .where(eq(usersTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(updated);
  },
);

export default router;
