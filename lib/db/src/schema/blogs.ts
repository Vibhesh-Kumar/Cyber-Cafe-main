import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const blogsTable = pgTable("blogs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImageUrl: text("cover_image_url"),
  authorName: text("author_name").notNull(),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
});

export const insertBlogSchema = createInsertSchema(blogsTable).omit({
  id: true,
  slug: true,
  publishedAt: true,
});
export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type Blog = typeof blogsTable.$inferSelect;
