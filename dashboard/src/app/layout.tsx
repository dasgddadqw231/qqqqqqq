import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { LayoutDashboard, CalendarDays, Users, BrainCircuit, Shield, Flame, Settings, Zap } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NAUD Central Command',
  description: 'Social-Flow Enterprise Manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white min-h-screen flex`}>
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-white/5 bg-zinc-950/80 backdrop-blur-xl flex flex-col p-4 fixed h-full z-50">
          <div className="flex items-center gap-3 mb-10 px-2 mt-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-wider">NAUD CC</span>
          </div>

          <nav className="flex-1 space-y-2">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 transition-all text-zinc-400 hover:text-white group">
              <LayoutDashboard className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
              <span className="font-medium text-sm">Dashboard</span>
            </Link>
            <Link href="/accounts" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 transition-all text-zinc-400 hover:text-white group">
              <Users className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
              <span className="font-medium text-sm">Accounts</span>
            </Link>
            <Link href="/personas" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 transition-all text-zinc-400 hover:text-white group">
              <BrainCircuit className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
              <span className="font-medium text-sm">AI Personas</span>
            </Link>
            <Link href="/calendar" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 transition-all text-zinc-400 hover:text-white group">
              <CalendarDays className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
              <span className="font-medium text-sm">Workloads</span>
            </Link>
            <Link href="/proxies" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 transition-all text-zinc-400 hover:text-white group">
              <Shield className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
              <span className="font-medium text-sm">Proxies</span>
            </Link>
            <Link href="/engage" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 transition-all text-zinc-400 hover:text-white group">
              <Zap className="w-4 h-4 group-hover:text-yellow-400 transition-colors" />
              <span className="font-medium text-sm">Engage</span>
            </Link>
          </nav>

          <div className="mt-auto border-t border-white/5 pt-4">
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 transition-all text-zinc-500 hover:text-zinc-300">
              <Settings className="w-4 h-4" />
              <span className="font-medium text-sm">Settings</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
