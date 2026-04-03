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

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', hoverColor: 'group-hover:text-blue-400' },
  { href: '/accounts', icon: Users, label: 'Accounts', hoverColor: 'group-hover:text-blue-400' },
  { href: '/personas', icon: BrainCircuit, label: 'Personas', hoverColor: 'group-hover:text-blue-400' },
  { href: '/calendar', icon: CalendarDays, label: 'Workloads', hoverColor: 'group-hover:text-blue-400' },
  { href: '/proxies', icon: Shield, label: 'Proxies', hoverColor: 'group-hover:text-purple-400' },
  { href: '/engage', icon: Zap, label: 'Engage', hoverColor: 'group-hover:text-yellow-400' },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white min-h-screen`}>
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 border-r border-white/5 bg-zinc-950/80 backdrop-blur-xl flex-col p-4 fixed h-full z-50">
          <div className="flex items-center gap-3 mb-10 px-2 mt-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-wider">NAUD CC</span>
          </div>

          <nav className="flex-1 space-y-2">
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 transition-all text-zinc-400 hover:text-white group">
                <item.icon className={`w-4 h-4 ${item.hoverColor} transition-colors`} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/5 pt-4">
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 transition-all text-zinc-500 hover:text-zinc-300">
              <Settings className="w-4 h-4" />
              <span className="font-medium text-sm">Settings</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-h-screen pb-20 lg:pb-0 lg:ml-64">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-white/5 px-2 py-1 safe-bottom">
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-2 py-2 text-zinc-500 hover:text-white transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </body>
    </html>
  )
}
