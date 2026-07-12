import { pgTable, pgEnum, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "operator",
  "admin",
]);

// Mirrors Clerk users locally (JIT-provisioned on first request) so we can
// join application/ticket ownership against a local id and store a role.
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user id
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default("customer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
