CREATE TABLE `persons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`date_of_birth` text NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `persons_email_unique` ON `persons` (`email`);--> statement-breakpoint
CREATE TABLE `phone_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type_name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `phone_types_type_name_unique` ON `phone_types` (`type_name`);--> statement-breakpoint
CREATE TABLE `phones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`number` text NOT NULL,
	`person_id` integer NOT NULL,
	`phone_type_id` integer NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`phone_type_id`) REFERENCES `phone_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`person_id` integer NOT NULL,
	`locality` text NOT NULL,
	`street` text NOT NULL,
	`number` integer NOT NULL,
	`notes` text,
	FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contact_activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`person_id` integer NOT NULL,
	`activity_type` text NOT NULL,
	`activity_date` text NOT NULL,
	`description` text,
	FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE cascade
);
