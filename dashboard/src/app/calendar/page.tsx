'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, CheckCircle2 } from "lucide-react"

export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date())

    // Mock scheduled workloads
    const workloads = [
        { id: 1, time: '10:00 AM', title: 'Global Threads Repost', target: '200 accounts', type: 'burst' },
        { id: 2, time: '11:45 AM', title: 'IG Reels Sequential Dwell', target: '50 accounts', type: 'nuxs' },
        { id: 3, time: '02:30 PM', title: 'YouTube Comment Wave', target: '75 accounts', type: 'ai' },
    ]

    return (
        <div className="p-10 space-y-8 min-h-screen">
            <header className="flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Workload Intelligence</h1>
                    <p className="text-sm text-zinc-400 mt-1">Schedule and orchestrate automated AI campaigns.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-900/20">
                    <Plus className="w-4 h-4" />
                    <span>New Campaign</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Calendar Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle>Schedule</CardTitle>
                            <CardDescription>Select a date to view or assign jobs.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border-none !text-white bg-transparent pointer-events-auto"
                            />
                        </CardContent>
                    </Card>

                    {/* Quick Metrics */}
                    <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-white/5">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg"><Target className="w-4 h-4 text-blue-400" /></div>
                                <div>
                                    <div className="text-sm font-medium text-white">Planned Actions</div>
                                    <div className="text-2xl font-bold text-white mt-1">3,492</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Tasks List */}
                <div className="lg:col-span-2">
                    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm h-full">
                        <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Campaign Schedule</CardTitle>
                                <CardDescription>Active workloads for {date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 flex gap-2 items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> Live Polling
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {workloads.map((job) => (
                                    <div key={job.id} className="flex items-center gap-5 p-4 rounded-xl border border-white/5 bg-zinc-950/50 hover:bg-zinc-800/50 transition-colors group cursor-pointer">
                                        <div className="flex flex-col items-center justify-center px-4 border-r border-white/5">
                                            <span className="text-lg font-bold text-white">{job.time.split(' ')[0]}</span>
                                            <span className="text-xs text-zinc-500 font-medium">{job.time.split(' ')[1]}</span>
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">{job.title}</h4>
                                            <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-2">
                                                <Users className="w-3 h-3" /> {job.target}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Badge variant="secondary" className="bg-zinc-800/50 border-zinc-700 text-zinc-300">
                                                {job.type}
                                            </Badge>
                                        </div>

                                        <div className="pl-4">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500/30 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                    </div>
                                ))}

                                <button className="w-full py-4 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30 flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-all text-sm font-medium mt-6">
                                    <Plus className="w-4 h-4" /> Schedule New Workload Block
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
