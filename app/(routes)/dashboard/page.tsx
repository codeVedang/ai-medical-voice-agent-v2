"use client"
import React, { useState, useEffect } from 'react'
import HistoryList from './_components/HistoryList'
import DoctorAgentList from './_components/DoctorAgentList'
import AddSessionDialog from './_components/AddSessionDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, Users, Clock, Star, FileText, Calendar, MessageSquare } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { SessionDetail } from './medical-agent/[sessionId]/page'
import { useRouter } from 'next/navigation'

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
                const now = new Date()
                return consultationDate.getMonth() === now.getMonth() &&
                       consultationDate.getFullYear() === now.getFullYear()
            }).length

            const avgDuration = 0 // Placeholder - duration not available in current data structure

            // Find most used doctor
            const doctorCount: { [key: string]: number } = {}
            consultations.forEach((c: SessionDetail) => {
                const doctor = c.selectedDoctor?.specialist || 'Unknown'
                doctorCount[doctor] = (doctorCount[doctor] || 0) + 1
            })
            const favoriteDoctor = Object.keys(doctorCount).reduce((a, b) =>
                doctorCount[a] > doctorCount[b] ? a : b, 'None')

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

    const handleScheduleFollowup = () => {
        // For now, just open the add session dialog
        // In future, could have a dedicated scheduling feature
        alert('Follow-up scheduling feature coming soon! Use "Start a Consultation" for now.')
    }

    const handleRateExperience = () => {
        // Open a simple feedback dialog or redirect to a feedback page
        const feedback = prompt('How was your experience? (1-5 stars)')
        if (feedback) {
            alert(`Thank you for your ${feedback}-star rating!`)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Welcome Section */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Welcome back, {user?.firstName || 'Doctor'}! 👋
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Here's what's happening with your AI medical consultations today.
                            </p>
                        </div>
                        <AddSessionDialog />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalConsultations}</div>
                            <p className="text-xs text-muted-foreground">
                                All time consultations
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.thisMonth}</div>
                            <p className="text-xs text-muted-foreground">
                                Consultations this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgDuration}min</div>
                            <p className="text-xs text-muted-foreground">
                                Average consultation time
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Favorite Doctor</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold truncate">{stats.favoriteDoctor}</div>
                            <p className="text-xs text-muted-foreground">
                                Most consulted specialist
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Consultations */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Recent Consultations
                            </CardTitle>
                            <CardDescription>
                                Your latest AI medical consultations and reports
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HistoryList />
                        </CardContent>
                    </Card>
                </div>

                {/* AI Specialist Doctors */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                AI Specialist Doctors
                            </CardTitle>
                            <CardDescription>
                                Choose from our expert AI medical specialists for your next consultation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DoctorAgentList />
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks and shortcuts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={handleViewAllReports}>
                                <FileText className="h-6 w-6" />
                                <span>View All Reports</span>
                            </Button>
                            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={handleScheduleFollowup}>
                                <Calendar className="h-6 w-6" />
                                <span>Schedule Follow-up</span>
                            </Button>
                            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={handleRateExperience}>
                                <MessageSquare className="h-6 w-6" />
                                <span>Rate Experience</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Dashboard
