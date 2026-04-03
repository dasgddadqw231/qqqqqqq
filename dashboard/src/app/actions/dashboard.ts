'use server'

import { createClient } from '@/utils/supabase/server'
import type { Platform } from '@/lib/types'

export async function getDashboardStats() {
  const supabase = await createClient()

  const [accountsRes, proxiesRes, jobsRes, recentJobsRes] = await Promise.all([
    supabase.from('accounts').select('id, platform, is_active'),
    supabase.from('proxies').select('id, status'),
    supabase.from('jobs').select('status'),
    supabase
      .from('jobs')
      .select('*, account:accounts(*)')
      .order('scheduled_for', { ascending: false })
      .limit(10),
  ])

  if (accountsRes.error) return { error: accountsRes.error.message }
  if (proxiesRes.error) return { error: proxiesRes.error.message }
  if (jobsRes.error) return { error: jobsRes.error.message }
  if (recentJobsRes.error) return { error: recentJobsRes.error.message }

  const accounts = accountsRes.data
  const proxies = proxiesRes.data
  const jobs = jobsRes.data

  const platformBreakdown: Record<string, number> = { instagram: 0, threads: 0, youtube: 0 }
  for (const account of accounts) {
    const p = account.platform as Platform
    if (p in platformBreakdown) {
      platformBreakdown[p]++
    }
  }

  const healthyProxies = proxies.filter((p) => p.status === 'active').length
  const healthyProxyPercent = proxies.length > 0
    ? Math.round((healthyProxies / proxies.length) * 100)
    : 0

  return {
    data: {
      accountCount: accounts.length,
      activeAccountCount: accounts.filter((a) => a.is_active).length,
      proxyCount: proxies.length,
      healthyProxyPercent,
      pendingJobs: jobs.filter((j) => j.status === 'pending').length,
      runningJobs: jobs.filter((j) => j.status === 'running').length,
      totalJobs: jobs.length,
      recentJobs: recentJobsRes.data,
      platformBreakdown,
    },
  }
}
