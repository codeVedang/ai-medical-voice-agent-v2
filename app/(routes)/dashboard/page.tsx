"use client"
import React, { useState, useEffect } from 'react'
import HistoryList from './_components/HistoryList'
import DoctorAgentList from './_components/DoctorAgentList'
import AddSessionDialog from './_components/AddSessionDialog'
import ScheduleFollowupDialog from './_components/ScheduleFollowupDialog'
import RateExperienceDialog from './_components/RateExperienceDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, Users, Clock, Star, FileText, Calendar, MessageSquare, Sparkles, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { SessionDetail } from './medical-agent/[sessionId]/page'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'

function Dashboard() {
    const { user } = useUser()
    const router = useRouter()
    const [stats, setStats] = useState({
        totalConsultations: 0,
        thisMonth: 0,
        avgDuration: 0,
        favoriteDoctor: ''
    })


    useEffect(() => {
        loadDashboardStats()
    }, [])

    const loadDashboardStats = async () => {
        try {
            const result = await axios.get('/api/session-chat?sessionId=all')
            const consultations = result.data || []

            const totalConsultations = consultations.length
            const thisMonth = consultations.filter((c: SessionDetail) => {
                const consultationDate = new Date(c.createdOn)
                // c.createdOn is like "Mon Feb 23 2026 21:03:50 GMT+0530" or an ISO string
                const now = new Date()
                return consultationDate.getMonth() === now.getMonth() &&
                    consultationDate.getFullYear() === now.getFullYear()
            }).length

            // Estimate duration since exact Vapi call length isn't saved in the DB.
            // A typical message takes ~5 seconds of speech/processing on average
            let totalEstimatedDurationSeconds = 0
            let sessionsWithConversations = 0

            consultations.forEach((c: any) => {
                const conversation = c.conversation || []
                if (conversation.length > 0) {
                    sessionsWithConversations++
                    // Roughly 8 seconds per message turn (user + system) 
                    totalEstimatedDurationSeconds += conversation.length * 8
                }
            })

            const avgDurationSeconds = sessionsWithConversations > 0
                ? totalEstimatedDurationSeconds / sessionsWithConversations
                : 0
            const avgDuration = avgDurationSeconds / 60

            // Find most used doctor
            const doctorCount: { [key: string]: number } = {}
            consultations.forEach((c: SessionDetail) => {
                const doctor = c.selectedDoctor?.specialist || 'Unknown'
                doctorCount[doctor] = (doctorCount[doctor] || 0) + 1
            })
            const favoriteDoctor = Object.keys(doctorCount).length > 0 ? Object.keys(doctorCount).reduce((a, b) =>
                doctorCount[a] > doctorCount[b] ? a : b) : 'None'

            setStats({
                totalConsultations,
                thisMonth,
                avgDuration: Math.round(avgDuration),
                favoriteDoctor
            })
        } catch (error) {
            console.error('Error loading dashboard stats:', error)
        }
    }

    const handleViewAllReports = () => {
        router.push('/dashboard/history')
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants: any = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    }

    return (
        <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] font-sans selection:bg-blue-200 dark:selection:bg-blue-900 pb-12">
            {/* Decorative Top Background blur */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/20 pointer-events-none" />

            {/* Welcome Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10 w-full">
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 text-white rounded-2xl p-8 sm:p-10 shadow-lg mb-10 border border-blue-500/20">
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2"
                            >
                                Welcome back, {user?.firstName || 'Doctor'}! <span className="inline-block origin-bottom-right hover:rotate-12 transition-transform cursor-default">👋</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-blue-100 text-lg max-w-2xl font-medium"
                            >
                                Here's what's happening with your AI medical consultations today.
                            </motion.p>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="shrink-0"
                        >
                            <AddSessionDialog />
                        </motion.div>
                    </div>
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Stats Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
                >
                    <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="h-full">
                        <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                <CardTitle className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Consultations</CardTitle>
                                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                                    <Activity className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{stats.totalConsultations}</div>
                                <div className="mt-2 flex items-center text-sm">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 border-none font-medium">
                                        All time
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="h-full">
                        <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                <CardTitle className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">This Month</CardTitle>
                                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <Users className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{stats.thisMonth}</div>
                                <div className="mt-2 flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    Active users
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="h-full">
                        <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                <CardTitle className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Duration</CardTitle>
                                <div className="p-2.5 bg-violet-50 dark:bg-violet-900/40 rounded-xl text-violet-600 dark:text-violet-400">
                                    <Clock className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                    {stats.avgDuration}<span className="text-2xl font-semibold text-gray-500 dark:text-gray-400 ml-1">min</span>
                                </div>
                                <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Per consultation
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="h-full">
                        <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                <CardTitle className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Favorite Doctor</CardTitle>
                                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
                                    <Star className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight truncate pb-1">
                                    {stats.favoriteDoctor}
                                </div>
                                <div className="mt-1 flex items-center text-sm">
                                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100 border-none font-medium">
                                        Top Specialist
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Column (Recent Consultations & Doctors) */}
                    <div className="xl:col-span-2 space-y-8">
                        {/* Recent Consultations */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 overflow-hidden">
                                <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                                <CardHeader className="bg-white/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/50 pb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                                                    <Activity className="h-5 w-5" />
                                                </div>
                                                Recent Consultations
                                            </CardTitle>
                                            <CardDescription className="mt-1.5 text-base">
                                                Your latest AI medical consultations and reports
                                            </CardDescription>
                                        </div>
                                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 group" onClick={handleViewAllReports}>
                                            View all <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 sm:p-6">
                                    <HistoryList />
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* AI Specialist Doctors */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 overflow-hidden">
                                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                                <CardHeader className="bg-white/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/50 pb-6">
                                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        AI Specialist Doctors
                                    </CardTitle>
                                    <CardDescription className="mt-1.5 text-base">
                                        Choose from our expert AI medical specialists for your next consultation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <DoctorAgentList />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Right Column (Quick Actions) */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 overflow-hidden sticky top-8">
                                <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                                <CardHeader className="bg-white/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/50 pb-6">
                                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                                        <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-lg text-violet-600 dark:text-violet-400">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        Quick Actions
                                    </CardTitle>
                                    <CardDescription className="mt-1.5 text-base">
                                        Common tasks and shortcuts
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={handleViewAllReports}
                                            className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all group text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white">View Reports</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">Access all your medical data</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </button>

                                        <div className="w-full">
                                            <ScheduleFollowupDialog>
                                                <button
                                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group text-left"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                                            <Calendar className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white">Schedule Follow-up</div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">Book an appointment</div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                                </button>
                                            </ScheduleFollowupDialog>
                                        </div>

                                        <div className="w-full">
                                            <RateExperienceDialog>
                                                <button
                                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-fuchsia-200 dark:hover:border-fuchsia-800 transition-all group text-left"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-fuchsia-50 dark:bg-fuchsia-900/30 rounded-lg text-fuchsia-600 dark:text-fuchsia-400 group-hover:scale-110 transition-transform">
                                                            <MessageSquare className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white">Rate Experience</div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">Help us improve our AI</div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-fuchsia-500 group-hover:translate-x-1 transition-all" />
                                                </button>
                                            </RateExperienceDialog>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
