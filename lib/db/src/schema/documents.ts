import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { applicationsTable } from "./applications";

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id")
    .notNull()
    .references(() => applicationsTable.id),
  fileName: text("file_name").notNull(),
  objectPath: text("object_path").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export type DocumentRecord = typeof documentsTable.$inferSelect;
