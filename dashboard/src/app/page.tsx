import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, Server, Users, Zap, Shield, Globe, Terminal, Play, Settings } from "lucide-react"

const MOCK_NODES = Array.from({ length: 8 }).map((_, i) => ({
  id: `env-${1000 + i}`,
  platform: i % 3 === 0 ? 'Instagram' : i % 2 === 0 ? 'YouTube' : 'Threads',
  status: i === 3 ? 'reconnecting' : 'active',
  proxy: `${Math.floor(Math.random() * 255)}.142.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  task: i === 3 ? 'Proxy rotation' : i % 2 === 0 ? 'Reels Dwell (NUXS)' : 'Contextual AI Reply',
  uptime: `${Math.floor(Math.random() * 48) + 1}h ${Math.floor(Math.random() * 60)}m`
}))

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30 font-sans">
      {/* Premium background effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <header className="flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">NAUD Central Command</h1>
              <p className="text-sm text-zinc-400">Social-Flow Enterprise Edition • System Nominal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-full border border-white/5 text-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>500/500 Active Environments</span>
            </div>
          </div>
        </header>

        {/* Top metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Global Load</CardTitle>
              <Activity className="w-4 h-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <Progress value={78} className="mt-3 h-1" />
              <p className="text-xs text-zinc-500 mt-2">Optimal NUXS distribution</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Profiles</CardTitle>
              <Users className="w-4 h-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,248</div>
              <div className="flex items-center mt-3 text-xs text-emerald-400">
                <span className="flex items-center gap-1">+48 <Globe className="w-3 h-3" /> new</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Proxy Health</CardTitle>
              <Shield className="w-4 h-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.8%</div>
              <p className="text-xs text-zinc-500 mt-2">2 IPs rotating</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">AI Tokens Used</CardTitle>
              <Terminal className="w-4 h-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128M</div>
              <p className="text-xs text-zinc-500 mt-2">Gemini 1.5 Pro • 3.2M / hr</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Cluster Status */}
        <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-zinc-950/20">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Live Execution Cluster</CardTitle>
                <CardDescription className="text-zinc-400">Real-time monitoring of Behavior Engine processes</CardDescription>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors border border-blue-500/50 flex items-center gap-2">
                  <Play className="w-4 h-4" /> Start Global Override
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-900/20">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Environment ID</TableHead>
                  <TableHead className="text-zinc-400">Platform</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Current Task</TableHead>
                  <TableHead className="text-zinc-400">Proxy IP</TableHead>
                  <TableHead className="text-right text-zinc-400">Uptime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_NODES.map((node) => (
                  <TableRow key={node.id} className="border-white/5 hover:bg-zinc-800/30 transition-colors">
                    <TableCell className="font-medium text-zinc-300">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-zinc-500" />
                        {node.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${node.platform === 'Instagram' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                          node.platform === 'YouTube' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}>
                        {node.platform}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${node.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                        }`}>
                        <span className="flex items-center gap-1.5">
                          {node.status === 'active' ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          ) : (
                            <Settings className="w-3 h-3 animate-spin" />
                          )}
                          {node.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-300 relative">
                      <span className="z-10 relative">{node.task}</span>
                      {node.status === 'active' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent w-full -z-0 translate-x-[-100%] animate-[shimmer_2s_infinite]" />}
                    </TableCell>
                    <TableCell className="text-zinc-500 font-mono text-sm">{node.proxy}</TableCell>
                    <TableCell className="text-right text-zinc-400">{node.uptime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
