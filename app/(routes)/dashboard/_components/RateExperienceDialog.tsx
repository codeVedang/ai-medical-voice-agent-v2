"use client"
import React, { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Loader2, MessageSquare, Star } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { motion, AnimatePresence } from 'motion/react'

export default function RateExperienceDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) {
            toast.error("Please select a star rating first")
            return
        }

        setLoading(true)
        try {
            await axios.post('/api/send-feedback', { rating, feedback })
            setSubmitted(true)
            toast.success("Thank you for your feedback!")
            setTimeout(() => {
                setOpen(false)
                // Reset state after closing
                setTimeout(() => {
                    setRating(0)
                    setFeedback('')
                    setSubmitted(false)
                }, 500)
            }, 2000)
        } catch (error) {
            toast.error("Failed to send feedback. Please try again.")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ? children : (
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                        <MessageSquare className="h-6 w-6" />
                        <span>Rate Experience</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <AnimatePresence mode="wait">
                    {!submitted ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <DialogHeader>
                                <DialogTitle className="text-xl">Rate Your Experience</DialogTitle>
                                <DialogDescription>
                                    How was your consultation? Your feedback helps us improve AIHealthAssis.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className="transition-all hover:scale-110 focus:outline-none"
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                onClick={() => setRating(star)}
                                            >
                                                <Star
                                                    className={`w-10 h-10 transition-colors ${(hoveredRating || rating) >= star
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'fill-gray-100 text-gray-300 dark:fill-gray-800 dark:text-gray-600'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">
                                        {rating === 1 && "Poor"}
                                        {rating === 2 && "Fair"}
                                        {rating === 3 && "Good"}
                                        {rating === 4 && "Very Good"}
                                        {rating === 5 && "Excellent"}
                                        {rating === 0 && "Select a rating"}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Additional Feedback (Optional)
                                    </label>
                                    <Textarea
                                        placeholder="Tell us what you liked or how we can improve..."
                                        className="resize-none min-h-[100px]"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                    />
                                </div>

                                <DialogFooter className="sm:justify-between">
                                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading || rating === 0}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit Feedback
                                    </Button>
                                </DialogFooter>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-10 flex flex-col items-center justify-center text-center space-y-4"
                        >
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                >
                                    <Star className="w-8 h-8 fill-green-500 text-green-500" />
                                </motion.div>
                            </div>
                            <h3 className="text-xl font-bold">Thank You!</h3>
                            <p className="text-gray-500 dark:text-gray-400 px-4">
                                Developer Vedang has received your feedback.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    )
}
