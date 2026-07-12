import {
  pgTable,
  serial,
  integer,
  text,
  numeric,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export type ServiceFormField = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
  required: boolean;
  options?: string[];
};

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  estimatedDays: integer("estimated_days").notNull(),
  formSchema: jsonb("form_schema").$type<ServiceFormField[]>().notNull(),
  requiredDocuments: jsonb("required_documents")
    .$type<string[]>()
    .notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof servicesTable.$inferSelect;
