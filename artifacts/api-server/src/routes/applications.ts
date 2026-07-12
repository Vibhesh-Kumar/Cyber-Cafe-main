import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import {
  db,
  applicationsTable,
  applicationStatusHistoryTable,
  servicesTable,
  categoriesTable,
  usersTable,
  documentsTable,
  paymentsTable,
} from "@workspace/db";
import {
  CreateApplicationBody,
  UpdateApplicationStatusBody,
  AddApplicationDocumentBody,
  ListApplicationsQueryParams,
  TrackApplicationQueryParams,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

async function toApiApplication(row: typeof applicationsTable.$inferSelect) {
  const [service] = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.id, row.serviceId));
  const [category] = service
    ? await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, service.categoryId))
    : [undefined];
  const [applicant] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, row.userId));
  const history = await db
    .select()
    .from(applicationStatusHistoryTable)
    .where(eq(applicationStatusHistoryTable.applicationId, row.id))
    .orderBy(applicationStatusHistoryTable.createdAt);

  return {
    id: row.id,
    applicationNumber: row.applicationNumber,
    userId: row.userId,
    applicantName: applicant?.name ?? "Unknown",
    applicantEmail: applicant?.email ?? "",
    serviceId: row.serviceId,
    serviceName: service?.name ?? "Unknown Service",
    categoryName: category?.name ?? "Unknown",
    formData: row.formData,
    status: row.status,
    paymentStatus: row.paymentStatus,
    amount: Number(row.amount),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    statusHistory: history,
  };
}

function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const rand = randomUUID().split("-")[0].toUpperCase();
  return `BCC-${year}-${rand}`;
}

router.get("/applications", requireAuth, async (req, res): Promise<void> => {
  const params = ListApplicationsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const isStaff =
    req.dbUser!.role === "operator" || req.dbUser!.role === "admin";

  const rows = await db
    .select()
    .from(applicationsTable)
    .where(
      and(
        isStaff ? undefined : eq(applicationsTable.userId, req.dbUser!.id),
        params.data.status
          ? eq(applicationsTable.status, params.data.status)
          : undefined,
      ),
    )
    .orderBy(desc(applicationsTable.createdAt));

  res.json(await Promise.all(rows.map(toApiApplication)));
});

router.post("/applications", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [service] = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.id, parsed.data.serviceId));

  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  const [created] = await db
    .insert(applicationsTable)
    .values({
      applicationNumber: generateApplicationNumber(),
      userId: req.dbUser!.id,
      serviceId: service.id,
      formData: parsed.data.formData,
      amount: service.price,
    })
    .returning();

  await db.insert(applicationStatusHistoryTable).values({
    applicationId: created.id,
    status: "submitted",
    note: "Application submitted",
  });

  res.status(201).json(await toApiApplication(created));
});

router.get("/applications/track", async (req, res): Promise<void> => {
  const params = TrackApplicationQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, params.data.email));

  if (!user) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const [application] = await db
    .select()
    .from(applicationsTable)
    .where(
      and(
        eq(applicationsTable.applicationNumber, params.data.applicationNumber),
        eq(applicationsTable.userId, user.id),
      ),
    );

  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const full = await toApiApplication(application);
  res.json({
    applicationNumber: full.applicationNumber,
    serviceName: full.serviceName,
    status: full.status,
    paymentStatus: full.paymentStatus,
    createdAt: full.createdAt,
    updatedAt: full.updatedAt,
    statusHistory: full.statusHistory,
  });
});

async function loadApplicationForRequest(
  req: import("express").Request,
  id: number,
) {
  const [application] = await db
    .select()
    .from(applicationsTable)
    .where(eq(applicationsTable.id, id));

  if (!application) return null;

  const isStaff =
    req.dbUser!.role === "operator" || req.dbUser!.role === "admin";
  if (!isStaff && application.userId !== req.dbUser!.id) {
    return "forbidden" as const;
  }

  return application;
}

router.get("/applications/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const application = await loadApplicationForRequest(req, id);
  if (application === null) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  if (application === "forbidden") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(await toApiApplication(application));
});

router.patch(
  "/applications/:id/status",
  requireAuth,
  requireRole("operator", "admin"),
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const parsed = UpdateApplicationStatusBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [updated] = await db
      .update(applicationsTable)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(applicationsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    await db.insert(applicationStatusHistoryTable).values({
      applicationId: id,
      status: parsed.data.status,
      note: parsed.data.note ?? null,
    });

    res.json(await toApiApplication(updated));
  },
);

router.get(
  "/applications/:id/documents",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const application = await loadApplicationForRequest(req, id);
    if (application === null) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    if (application === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const docs = await db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.applicationId, id));

    res.json(docs);
  },
);

router.post(
  "/applications/:id/documents",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const application = await loadApplicationForRequest(req, id);
    if (application === null) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    if (application === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const parsed = AddApplicationDocumentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [created] = await db
      .insert(documentsTable)
      .values({ applicationId: id, ...parsed.data })
      .returning();

    res.status(201).json(created);
  },
);

router.post(
  "/applications/:id/pay",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const application = await loadApplicationForRequest(req, id);
    if (application === null) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    if (application === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const [payment] = await db
      .insert(paymentsTable)
      .values({
        applicationId: id,
        amount: application.amount,
        status: "paid",
        method: "mock",
        paidAt: new Date(),
      })
      .returning();

    await db
      .update(applicationsTable)
      .set({ paymentStatus: "paid", updatedAt: new Date() })
      .where(eq(applicationsTable.id, id));

    res.json({ ...payment, amount: Number(payment.amount) });
  },
);

export default router;
