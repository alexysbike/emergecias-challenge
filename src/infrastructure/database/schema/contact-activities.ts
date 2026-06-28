import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { persons } from "./persons";

export const contactActivities = sqliteTable("contact_activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  personId: integer("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  activityType: text("activity_type").notNull(),
  activityDate: text("activity_date").notNull(),
  description: text("description"),
});
