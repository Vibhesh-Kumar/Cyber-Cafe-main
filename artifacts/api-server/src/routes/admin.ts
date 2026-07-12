import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import {
  db,
  applicationsTable,
  usersTable,
  servicesTable,
  categoriesTable,
} from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get(
  "/admin/stats",
  requireAuth,
  requireRole("admin"),
  async (_req, res): Promise<void> => {
    const allApplications = await db.select().from(applicationsTable);
    const [{ count: totalUsers }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable);
    const [{ count: totalServices }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(servicesTable);

    const applicationsByStatus: Record<string, number> = {};
    let totalRevenue = 0;
    for (const app of allApplications) {
      applicationsByStatus[app.status] =
        (applicationsByStatus[app.status] ?? 0) + 1;
      if (app.paymentStatus === "paid") {
        totalRevenue += Number(app.amount);
      }
    }

    const recentRows = await db
      .select()
      .from(applicationsTable)
      .orderBy(desc(applicationsTable.createdAt))
      .limit(10);

    const recentApplications = await Promise.all(
      recentRows.map(async (row) => {
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
          statusHistory: [],
        };
      }),
    );

    res.json({
      totalApplications: allApplications.length,
      pendingApplications: allApplications.filter(
        (a) => a.status === "submitted" || a.status === "under_review",
      ).length,
      completedApplications: allApplications.filter(
        (a) => a.status === "completed",
      ).length,
      totalRevenue,
      totalUsers,
      totalServices,
      applicationsByStatus,
      recentApplications,
    });
  },
);

export default router;
