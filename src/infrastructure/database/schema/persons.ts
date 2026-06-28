import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const persons = sqliteTable("persons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  email: text("email").notNull().unique(),
});
