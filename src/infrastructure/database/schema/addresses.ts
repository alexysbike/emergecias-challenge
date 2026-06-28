import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { persons } from "./persons";

export const addresses = sqliteTable("addresses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  personId: integer("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  locality: text("locality").notNull(),
  street: text("street").notNull(),
  number: integer("number").notNull(),
  notes: text("notes"),
});
