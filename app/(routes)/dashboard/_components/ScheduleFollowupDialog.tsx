"use client"
import React, { useState } from 'react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { Calendar } from 'lucide-react'

function ScheduleFollowupDialog({ open, setOpen, children }: { open?: boolean, setOpen?: (open: boolean) => void, children?: React.ReactNode }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const onSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!name || !email || !date) {
            toast.error('Please provide name, email and a date')
            return
        }
        setLoading(true)
        try {
            const scheduledDate = new Date(`${date}T${time || '09:00'}:00`)
            const scheduledAt = scheduledDate.toISOString()
            await axios.post('/api/schedule-followup', { name, email, scheduledAt, message })
            toast.success('Scheduled successfully. An email will be sent on the scheduled date.')
            // Reset form and close dialog
            setName('')
            setEmail('')
            setDate('')
            setTime('')
            setMessage('')
            setOpen?.(false)
        } catch (err) {
            console.error(err)
            toast.error('Failed to schedule follow-up')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ? children : (
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                        <Calendar className="h-6 w-6" />
                        <span>Schedule Follow-up</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Schedule a Follow-up</DialogTitle>
                    <DialogDescription>
                        Provide the user's details and the date to send the follow-up email.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-3">
                    <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        <div>
                            <label className="text-sm font-medium">Date</label>
                            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Time (optional)</label>
                            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Message (optional)</label>
                        <textarea className="w-full border rounded p-2" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setOpen?.(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Scheduling...' : 'Schedule'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default ScheduleFollowupDialog
