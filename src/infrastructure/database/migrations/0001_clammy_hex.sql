PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_contact_activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`person_id` integer NOT NULL,
	`activity_type` text NOT NULL,
	`activity_date` text NOT NULL,
	`description` text,
	FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "contact_activities_activity_type_check" CHECK("__new_contact_activities"."activity_type" IN ('call', 'meeting', 'email'))
);
--> statement-breakpoint
INSERT INTO `__new_contact_activities`("id", "person_id", "activity_type", "activity_date", "description") SELECT "id", "person_id", "activity_type", "activity_date", "description" FROM `contact_activities`;--> statement-breakpoint
DROP TABLE `contact_activities`;--> statement-breakpoint
ALTER TABLE `__new_contact_activities` RENAME TO `contact_activities`;--> statement-breakpoint
PRAGMA foreign_keys=ON;