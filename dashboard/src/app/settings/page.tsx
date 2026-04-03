'use client'

import { useEffect, useState } from 'react'
import { Settings, LogOut, Database, User, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { logout, getCurrentUser, checkDbConnection } from '@/app/actions/auth'

export default function SettingsPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; error?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [user, db] = await Promise.all([
        getCurrentUser(),
        checkDbConnection(),
      ])
      setEmail(user?.email ?? null)
      setDbStatus(db)
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await logout()
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center shadow-lg">
          <Settings className="w-6 h-6 text-zinc-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Application configuration and status</p>
        </div>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* User Info */}
        <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="w-4 h-4 text-blue-400" />
              Current User
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-zinc-500 text-sm">Loading...</p>
            ) : email ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-300 font-mono text-sm">{email}</p>
                  <p className="text-zinc-500 text-xs mt-1">Authenticated via Supabase</p>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Signed In
                </Badge>
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">Not authenticated</p>
            )}
          </CardContent>
        </Card>

        {/* DB Connection */}
        <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Database className="w-4 h-4 text-purple-400" />
              Database Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-zinc-500 text-sm">Checking connection...</p>
            ) : dbStatus?.connected ? (
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Connected
                </Badge>
                <span className="text-zinc-500 text-xs">Supabase PostgreSQL</span>
              </div>
            ) : (
              <div className="space-y-2">
                <Badge className="bg-red-500/15 text-red-400 border border-red-500/30">
                  Disconnected
                </Badge>
                {dbStatus?.error && (
                  <p className="text-red-400/70 text-xs font-mono">{dbStatus.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* App Version */}
        <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Info className="w-4 h-4 text-zinc-400" />
              Application Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">App Name</span>
                <span className="text-zinc-300">NAUD Central Command</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Version</span>
                <span className="text-zinc-300 font-mono">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Framework</span>
                <span className="text-zinc-300">Next.js + Supabase</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
          <CardContent className="pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-300 font-medium">Sign Out</p>
                <p className="text-zinc-500 text-xs mt-0.5">End your current session</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
