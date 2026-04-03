'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select'
import { Plus, Clock, Link2, Trash2, Play, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import type { Job, Account, JobType, JobStatus } from '@/lib/types'
import { JOB_TYPE_LABELS } from '@/lib/types'
import { createJob, deleteJob, updateJobStatus } from '@/app/actions/jobs'

const JOB_TYPES: JobType[] = [
    'watch_reels',
    'story_share',
    'auto_reply',
    'threads_dwell',
    'threads_repost',
    'youtube_watch',
    'youtube_comment',
]

const STATUS_STYLES: Record<JobStatus, string> = {
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    running: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    failed: 'bg-red-500/15 text-red-400 border-red-500/20',
}

function formatDate(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function formatTime(iso: string): string {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function CalendarClient({
    jobs,
    accounts,
}: {
    jobs: Job[]
    accounts: Account[]
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [dialogOpen, setDialogOpen] = useState(false)

    // Form state
    const [formAccountId, setFormAccountId] = useState<string>('')
    const [formType, setFormType] = useState<string>('')
    const [formTargetUrl, setFormTargetUrl] = useState('')
    const [formDateTime, setFormDateTime] = useState('')
    const [formError, setFormError] = useState('')

    const dateStr = selectedDate ? formatDate(selectedDate) : ''
    const filteredJobs = jobs.filter((job) => {
        if (!dateStr) return false
        return job.scheduled_for.startsWith(dateStr)
    })

    const stats = {
        total: filteredJobs.length,
        pending: filteredJobs.filter((j) => j.status === 'pending').length,
        running: filteredJobs.filter((j) => j.status === 'running').length,
        success: filteredJobs.filter((j) => j.status === 'success').length,
        failed: filteredJobs.filter((j) => j.status === 'failed').length,
    }

    async function handleCreate() {
        setFormError('')
        if (!formType) {
            setFormError('Job type is required')
            return
        }
        if (!formDateTime) {
            setFormError('Schedule date/time is required')
            return
        }

        const fd = new FormData()
        if (formAccountId) fd.set('account_id', formAccountId)
        fd.set('type', formType)
        if (formTargetUrl) fd.set('target_url', formTargetUrl)
        fd.set('scheduled_for', new Date(formDateTime).toISOString())

        const result = await createJob(fd)
        if (result.error) {
            setFormError(result.error)
            return
        }

        setDialogOpen(false)
        setFormAccountId('')
        setFormType('')
        setFormTargetUrl('')
        setFormDateTime('')
        startTransition(() => router.refresh())
    }

    async function handleDelete(id: string) {
        const result = await deleteJob(id)
        if (!result.error) {
            startTransition(() => router.refresh())
        }
    }

    async function handleStatusChange(id: string, status: JobStatus) {
        const result = await updateJobStatus(id, status)
        if (!result.error) {
            startTransition(() => router.refresh())
        }
    }

    return (
        <div className="p-4 lg:p-10 space-y-6 lg:space-y-8 min-h-screen">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-2xl">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
                        Workload Intelligence
                    </h1>
                    <p className="text-xs lg:text-sm text-zinc-400 mt-1">
                        Schedule and orchestrate automated AI campaigns.
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger
                        render={
                            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-900/20 h-10 px-4 gap-2">
                                <Plus className="w-4 h-4" />
                                New Job
                            </Button>
                        }
                    />
                    <DialogContent className="bg-zinc-900 border border-white/10 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-white">Create New Job</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            {formError && (
                                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                    {formError}
                                </p>
                            )}
                            {/* Account select */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400">Account</label>
                                <Select value={formAccountId} onValueChange={(v) => setFormAccountId(v ?? '')}>
                                    <SelectTrigger className="w-full bg-zinc-800/50 border-white/10 text-white">
                                        <SelectValue placeholder="Select account (optional)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-800 border-white/10 text-white">
                                        {accounts.map((acc) => (
                                            <SelectItem key={acc.id} value={acc.id}>
                                                {acc.username} ({acc.platform})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Job type */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400">Job Type *</label>
                                <Select value={formType} onValueChange={(v) => setFormType(v ?? '')}>
                                    <SelectTrigger className="w-full bg-zinc-800/50 border-white/10 text-white">
                                        <SelectValue placeholder="Select job type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-800 border-white/10 text-white">
                                        {JOB_TYPES.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {JOB_TYPE_LABELS[t]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Target URL */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400">Target URL</label>
                                <Input
                                    placeholder="https://..."
                                    value={formTargetUrl}
                                    onChange={(e) => setFormTargetUrl(e.target.value)}
                                    className="bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-500"
                                />
                            </div>
                            {/* Schedule */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400">Schedule Date/Time *</label>
                                <Input
                                    type="datetime-local"
                                    value={formDateTime}
                                    onChange={(e) => setFormDateTime(e.target.value)}
                                    className="bg-zinc-800/50 border-white/10 text-white"
                                />
                            </div>
                        </div>
                        <DialogFooter className="bg-zinc-800/50 border-white/5">
                            <Button
                                onClick={handleCreate}
                                className="bg-blue-600 hover:bg-blue-500 text-white"
                            >
                                Create Job
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                {/* Left: Calendar + Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle>Schedule</CardTitle>
                            <CardDescription>Select a date to view or assign jobs.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md border-none !text-white bg-transparent"
                            />
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-white/5">
                        <CardContent className="p-6 space-y-3">
                            <h3 className="text-sm font-medium text-zinc-400">
                                {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5">
                                    <div className="text-xs text-zinc-500">Total</div>
                                    <div className="text-xl font-bold text-white">{stats.total}</div>
                                </div>
                                <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5">
                                    <div className="text-xs text-amber-400">Pending</div>
                                    <div className="text-xl font-bold text-amber-400">{stats.pending}</div>
                                </div>
                                <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5">
                                    <div className="text-xs text-blue-400">Running</div>
                                    <div className="text-xl font-bold text-blue-400">{stats.running}</div>
                                </div>
                                <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5">
                                    <div className="text-xs text-emerald-400">Success</div>
                                    <div className="text-xl font-bold text-emerald-400">{stats.success}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Jobs list */}
                <div className="lg:col-span-2">
                    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm h-full">
                        <CardHeader className="border-b border-white/5">
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <CardTitle>Jobs</CardTitle>
                                    <CardDescription>
                                        {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} scheduled for{' '}
                                        {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </CardDescription>
                                </div>
                                {isPending && (
                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 flex gap-2 items-center">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Refreshing
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {filteredJobs.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 border border-white/5 flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-6 h-6 text-zinc-600" />
                                    </div>
                                    <p className="text-zinc-500 text-sm">No jobs scheduled for this date.</p>
                                    <p className="text-zinc-600 text-xs mt-1">Click &quot;New Job&quot; to create one.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredJobs.map((job) => (
                                        <div
                                            key={job.id}
                                            className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl border border-white/5 bg-zinc-950/50 hover:bg-zinc-800/40 transition-colors group"
                                        >
                                            {/* Time */}
                                            <div className="flex flex-col items-center justify-center px-3 border-r border-white/5 min-w-[70px]">
                                                <span className="text-sm font-bold text-white">
                                                    {formatTime(job.scheduled_for).split(' ')[0]}
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-medium">
                                                    {formatTime(job.scheduled_for).split(' ')[1]}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">
                                                        {JOB_TYPE_LABELS[job.type]}
                                                    </h4>
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_STYLES[job.status]}`}
                                                    >
                                                        {job.status}
                                                    </span>
                                                </div>
                                                {job.account && (
                                                    <p className="text-xs text-zinc-400">
                                                        @{job.account.username}
                                                    </p>
                                                )}
                                                {job.target_url && (
                                                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1 truncate">
                                                        <Link2 className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">{job.target_url}</span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0">
                                                {job.status === 'pending' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => handleStatusChange(job.id, 'running')}
                                                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                                    >
                                                        <Play className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                                {job.status === 'running' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => handleStatusChange(job.id, 'success')}
                                                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => handleStatusChange(job.id, 'failed')}
                                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleDelete(job.id)}
                                                    className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
