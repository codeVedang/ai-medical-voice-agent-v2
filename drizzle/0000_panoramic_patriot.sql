CREATE TABLE "sessionChatTable" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sessionChatTable_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sessionId" varchar NOT NULL,
	"notes" text,
	"conversation" json,
	"report" json,
	"createdBy" varchar,
	"createdOn" varchar,
	"selectedDoctor" json
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"credits" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sessionChatTable" ADD CONSTRAINT "sessionChatTable_createdBy_users_email_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- Add schedule_followups table to store scheduled follow-up emails
CREATE TABLE IF NOT EXISTS "schedule_followups" (
	"id" serial PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"scheduledAt" varchar NOT NULL,
	"message" text,
	"sent" integer DEFAULT 0,
	"createdOn" varchar
);
--> statement-breakpoint