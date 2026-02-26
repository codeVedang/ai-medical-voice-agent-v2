// Simple migration runner: applies safe ALTER for schedule_followups
// Usage: node scripts/apply_db_migrations.js

const { Client } = require('pg')
require('dotenv').config()

async function run() {
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set in environment. Add it to .env or export it.')
    process.exit(1)
  }

  const client = new Client({ connectionString: DATABASE_URL })
  try {
    await client.connect()
    console.log('Connected to DB')

    // Create table if it doesn't exist (idempotent)
    const createSql = `CREATE TABLE IF NOT EXISTS schedule_followups (
      id serial PRIMARY KEY,
      name varchar(255) NOT NULL,
      email varchar(255) NOT NULL,
      scheduledAt varchar NOT NULL,
      message text,
      sent integer DEFAULT 0,
      createdOn varchar
    );`

    await client.query(createSql)
    console.log('Ensured schedule_followups table exists')

    // Rename lowercase columns if present (use PL/pgSQL block to avoid syntax issues)
    const renameSql = `DO $$\nBEGIN\n  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='schedule_followups' AND column_name='scheduledat') THEN\n    EXECUTE 'ALTER TABLE schedule_followups RENAME COLUMN scheduledat TO "scheduledAt"';\n  END IF;\n  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='schedule_followups' AND column_name='createdon') THEN\n    EXECUTE 'ALTER TABLE schedule_followups RENAME COLUMN createdon TO "createdOn"';\n  END IF;\nEND\n$$;`;
    await client.query(renameSql)
    console.log('Renamed columns scheduledat -> "scheduledAt" and createdon -> "createdOn" (if existed)')

    console.log('Migration finished')
  } catch (err) {
    console.error('Migration error', err)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

run()
