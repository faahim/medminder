CREATE TABLE `dose_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`medication_id` text NOT NULL,
	`scheduled_date` text NOT NULL,
	`scheduled_time` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`logged_at` text,
	`notes` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`medication_id`) REFERENCES `medications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `medications` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`dosage` text NOT NULL,
	`dosage_unit` text DEFAULT 'tablet' NOT NULL,
	`instructions` text,
	`meal_timing` text DEFAULT 'anytime' NOT NULL,
	`schedule_type` text DEFAULT 'daily' NOT NULL,
	`schedule_times` text DEFAULT '["08:00"]' NOT NULL,
	`schedule_weekdays` text,
	`schedule_interval_hours` integer,
	`start_date` text NOT NULL,
	`end_date` text,
	`depends_on_medication_id` text,
	`depends_on_offset_days` integer,
	`photo_uri` text,
	`color` text DEFAULT '#4CAF50' NOT NULL,
	`notifications_enabled` integer DEFAULT true NOT NULL,
	`notification_sound` text DEFAULT 'default' NOT NULL,
	`vibration_enabled` integer DEFAULT true NOT NULL,
	`reminder_advance_minutes` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`snooze_duration_minutes` integer DEFAULT 15 NOT NULL,
	`missed_threshold_minutes` integer DEFAULT 60 NOT NULL,
	`notification_sound` text DEFAULT 'default' NOT NULL,
	`haptic_feedback` integer DEFAULT true NOT NULL,
	`dark_mode` text DEFAULT 'system' NOT NULL,
	`font_size` text DEFAULT 'normal' NOT NULL,
	`reminder_advance_minutes` integer DEFAULT 0 NOT NULL,
	`notifications_enabled` integer DEFAULT true NOT NULL
);
