import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/config/db'
import { ScheduleFollowupsTable } from '@/config/schema'
import nodemailer from 'nodemailer'
import { sql } from 'drizzle-orm/sql'
import { eq } from 'drizzle-orm'

async function sendMail(to: string, subject: string, text: string) {
  const host = process.env.EMAIL_SMTP_HOST
  const port = Number(process.env.EMAIL_SMTP_PORT || '587')
  const user = process.env.EMAIL_SMTP_USER
  const pass = process.env.EMAIL_SMTP_PASS
  const from = process.env.EMAIL_FROM || user

  if (!host || !user || !pass) {
    throw new Error('SMTP not configured. Set EMAIL_SMTP_HOST, EMAIL_SMTP_USER, EMAIL_SMTP_PASS')
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  })

  await transporter.sendMail({ from, to, subject, text })
}

async function processFollowups() {
  try {
    // find due followups (scheduledAt date <= now) and not sent
    const now = new Date().toISOString()
    const rows: any = await db.select().from(ScheduleFollowupsTable).where(sql`${ScheduleFollowupsTable.scheduledAt} <= ${now} AND ${ScheduleFollowupsTable.sent} = 0`)

    for (const row of rows) {
      try {
        const subject = `Follow-up reminder for ${row.name}`
        const text = `Hello ${row.name},\n\n${row.message || 'This is a reminder for your scheduled follow-up.'}\n\nRegards`
        await sendMail(row.email, subject, text)
        // mark as sent
        await db.update(ScheduleFollowupsTable).set({ sent: 1 }).where(eq(ScheduleFollowupsTable.id, row.id))
      } catch (err) {
        console.error('Failed to send email to', row.email, err)
      }
    }

    return NextResponse.json({ success: true, sent: rows.length })
  } catch (err) {
    console.error('send-due-followups error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // Check for authorization. Vercel automatically sends `Bearer ${process.env.CRON_SECRET}` 
  // if you have it configured in your environment variables.
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return processFollowups();
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return processFollowups();
}
