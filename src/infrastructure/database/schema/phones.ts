import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { persons } from "./persons";
import { phoneTypes } from "./phone-types";

export const phones = sqliteTable("phones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  number: text("number").notNull(),
  personId: integer("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  phoneTypeId: integer("phone_type_id")
    .notNull()
    .references(() => phoneTypes.id),
});
