import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const phoneTypes = sqliteTable("phone_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  typeName: text("type_name").notNull().unique(),
});
