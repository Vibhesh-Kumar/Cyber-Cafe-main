import {
  pgTable,
  serial,
  integer,
  text,
  pgEnum,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { applicationsTable } from "./applications";

export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "resolved",
]);

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: ticketStatusEnum("status").notNull().default("open"),
  adminReply: text("admin_reply"),
  applicationId: integer("application_id").references(
    () => applicationsTable.id,
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({
  id: true,
  status: true,
  adminReply: true,
  createdAt: true,
});
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
