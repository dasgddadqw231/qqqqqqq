import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, Users, Zap, Shield, Globe, Settings } from "lucide-react"
import { getDashboardStats } from "@/app/actions/dashboard"
import { syncAdsPowerProfiles } from "@/app/actions/adspower-sync"
import { JOB_TYPE_LABELS, PLATFORM_LABELS } from "@/lib/types"
import type { JobType, JobStatus, Platform } from "@/lib/types"

const STATUS_STYLES: Record<JobStatus, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  running: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
}

const PLATFORM_STYLES: Record<Platform, string> = {
  instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  threads: "bg-zinc-800 text-zinc-300 border-zinc-700",
  youtube: "bg-red-500/10 text-red-400 border-red-500/20",
}

function formatScheduledTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export default async function DashboardPage() {
  await syncAdsPowerProfiles()
  const result = await getDashboardStats()

  const stats = "data" in result && result.data
    ? result.data
    : {
        accountCount: 0,
        activeAccountCount: 0,
        proxyCount: 0,
        healthyProxyPercent: 0,
        pendingJobs: 0,
        runningJobs: 0,
        totalJobs: 0,
        recentJobs: [],
        platformBreakdown: { instagram: 0, threads: 0, youtube: 0 },
      }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30 font-sans">
      {/* Premium background effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-10 space-y-6 lg:space-y-8">

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-2xl">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="p-2.5 lg:p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl lg:rounded-2xl">
              <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight">NAUD Central Command</h1>
              <p className="text-xs lg:text-sm text-zinc-400">Social-Flow Enterprise Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-zinc-800/50 rounded-full border border-white/5 text-xs lg:text-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{stats.activeAccountCount}/{stats.accountCount} Active</span>
            </div>
          </div>
        </header>

        {/* Top metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
          <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Accounts</CardTitle>
              <Users className="w-4 h-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAccountCount}</div>
              <div className="flex items-center mt-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" /> {stats.accountCount} total
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Proxy Health</CardTitle>
              <Shield className="w-4 h-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.healthyProxyPercent}%</div>
              <Progress value={stats.healthyProxyPercent} className="mt-3 h-1" />
              <p className="text-xs text-zinc-500 mt-2">{stats.proxyCount} proxies total</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Running / Pending Jobs</CardTitle>
              <Activity className="w-4 h-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className="text-blue-400">{stats.runningJobs}</span>
                <span className="text-zinc-600 mx-1">/</span>
                <span className="text-amber-400">{stats.pendingJobs}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-2">running / pending</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Jobs</CardTitle>
              <Zap className="w-4 h-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs.toLocaleString()}</div>
              <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
                <span>IG {stats.platformBreakdown.instagram}</span>
                <span>TH {stats.platformBreakdown.threads}</span>
                <span>YT {stats.platformBreakdown.youtube}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Jobs Table */}
        <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-zinc-950/20">
            <div>
              <CardTitle className="text-lg">Recent Jobs</CardTitle>
              <CardDescription className="text-zinc-400">Last 10 scheduled jobs across all platforms</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader className="bg-zinc-900/20">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Job Type</TableHead>
                  <TableHead className="text-zinc-400">Account</TableHead>
                  <TableHead className="text-zinc-400">Platform</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-right text-zinc-400">Scheduled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentJobs.length === 0 ? (
                  <TableRow className="border-white/5">
                    <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                      No jobs found
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recentJobs.map((job) => {
                    const account = job.account as { id: string; username: string; platform: Platform } | null
                    const jobType = job.type as JobType
                    const jobStatus = job.status as JobStatus

                    return (
                      <TableRow key={job.id} className="border-white/5 hover:bg-zinc-800/30 transition-colors">
                        <TableCell className="font-medium text-zinc-300">
                          {JOB_TYPE_LABELS[jobType] ?? jobType}
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          {account?.username ?? <span className="text-zinc-600">-</span>}
                        </TableCell>
                        <TableCell>
                          {account?.platform ? (
                            <Badge variant="outline" className={PLATFORM_STYLES[account.platform]}>
                              {PLATFORM_LABELS[account.platform]}
                            </Badge>
                          ) : (
                            <span className="text-zinc-600">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_STYLES[jobStatus]}>
                            <span className="flex items-center gap-1.5">
                              {jobStatus === "running" ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                              ) : jobStatus === "pending" ? (
                                <Settings className="w-3 h-3" />
                              ) : jobStatus === "success" ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              )}
                              {jobStatus}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-zinc-400 text-sm">
                          {formatScheduledTime(job.scheduled_for)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
