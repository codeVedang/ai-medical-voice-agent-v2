import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
    try {
        const { rating, feedback } = await req.json()

        if (!rating) {
            return NextResponse.json({ error: 'Rating is required' }, { status: 400 })
        }

        // Configure Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_SMTP_USER || process.env.EMAIL_USER,
                pass: process.env.EMAIL_SMTP_PASS || process.env.EMAIL_PASS
            }
        })

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_SMTP_USER || process.env.EMAIL_USER,
            to: 'vedangt17@gmail.com', // Explicitly sending to Vedang
            subject: `New AIHealthAssis Feedback - ${rating} Stars`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f7f6;">
                    <div style="max-w: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #2563eb; margin-bottom: 20px;">New Platform Feedback</h2>
                        <div style="margin-bottom: 15px;">
                            <strong>Rating:</strong> <span style="font-size: 20px; color: #fbbf24;">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span> (${rating}/5)
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong>Feedback Message:</strong>
                            <p style="background: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; border-radius: 4px; margin-top: 10px;">
                                ${feedback || '<i>No text feedback provided.</i>'}
                            </p>
                        </div>
                        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">This is an automated message from AIHealthAssis.</p>
                    </div>
                </div>
            `
        }

        // Send email
        await transporter.sendMail(mailOptions)

        return NextResponse.json({ success: true, message: 'Feedback sent successfully' })
    } catch (error) {
        console.error('Error sending feedback:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
