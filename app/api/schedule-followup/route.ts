import { NextResponse } from 'next/server'
import { db } from '@/config/db'
import { ScheduleFollowupsTable } from '@/config/schema'

export async function POST(req: Request) {
    try {
        const { name, email, scheduledAt, message } = await req.json()
        if (!name || !email || !scheduledAt) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const result = await db.insert(ScheduleFollowupsTable).values({
            name,
            email,
            scheduledAt,
            message,
            createdOn: new Date().toISOString()
        }).returning()

        return NextResponse.json({ success: true, data: result[0] })
    } catch (error) {
        console.error('Error scheduling follow-up:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
