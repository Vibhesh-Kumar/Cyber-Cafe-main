import {
  pgTable,
  serial,
  integer,
  text,
  pgEnum,
  numeric,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { servicesTable } from "./services";

export const applicationStatusEnum = pgEnum("application_status", [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "completed",
]);

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid"]);

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  applicationNumber: text("application_number").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  serviceId: integer("service_id")
    .notNull()
    .references(() => servicesTable.id),
  formData: jsonb("form_data").$type<Record<string, unknown>>().notNull(),
  status: applicationStatusEnum("status").notNull().default("submitted"),
  paymentStatus: paymentStatusEnum("payment_status")
    .notNull()
    .default("pending"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(
  applicationsTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;

export const applicationStatusHistoryTable = pgTable(
  "application_status_history",
  {
    id: serial("id").primaryKey(),
    applicationId: integer("application_id")
      .notNull()
      .references(() => applicationsTable.id),
    status: applicationStatusEnum("status").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
);

export type StatusHistoryEntry =
  typeof applicationStatusHistoryTable.$inferSelect;
