-- Create schedule_followups table
CREATE TABLE IF NOT EXISTS schedule_followups (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  scheduledAt varchar NOT NULL,
  message text,
  sent integer DEFAULT 0,
  createdOn varchar
);
