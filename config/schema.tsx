import { integer, pgTable, text, varchar, json } from "drizzle-orm/pg-core";


export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer()
});

export const SessionChatTable = pgTable('SessionChatTable',{
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar().notNull(),
  notes: text(),
  conversation: json(),
  report: json(),
  createdBy: varchar().references(()=>usersTable.email),
  createdOn:varchar(),
  selectedDoctor:json(),
  
})

export const ScheduleFollowupsTable = pgTable('schedule_followups', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  scheduledAt: varchar().notNull(),
  message: text(),
  sent: integer().default(0),
  createdOn: varchar()
})