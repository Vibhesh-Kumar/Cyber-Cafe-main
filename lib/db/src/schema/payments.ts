import {
  pgTable,
  serial,
  integer,
  numeric,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { applicationsTable, paymentStatusEnum } from "./applications";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id")
    .notNull()
    .references(() => applicationsTable.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  method: text("method").notNull().default("mock"),
  paidAt: timestamp("paid_at"),
});

export type Payment = typeof paymentsTable.$inferSelect;
