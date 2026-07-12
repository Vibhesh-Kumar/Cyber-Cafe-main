import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const faqsTable = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category"),
});

export const insertFaqSchema = createInsertSchema(faqsTable).omit({
  id: true,
});
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqsTable.$inferSelect;
