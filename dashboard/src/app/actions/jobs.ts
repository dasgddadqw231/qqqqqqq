'use server'

import { createClient } from '@/utils/supabase/server'
import type { JobStatus } from '@/lib/types'

export async function getJobs(filters?: { status?: string; date?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('jobs')
    .select('*, account:accounts(*)')
    .order('scheduled_for', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.date) {
    const start = `${filters.date}T00:00:00.000Z`
    const end = `${filters.date}T23:59:59.999Z`
    query = query.gte('scheduled_for', start).lte('scheduled_for', end)
  }

  const { data, error } = await query

  if (error) return { error: error.message }
  return { data }
}

export async function createJob(formData: FormData) {
  const supabase = await createClient()

  const account_id = (formData.get('account_id') as string) || null
  const type = formData.get('type') as string
  const target_url = (formData.get('target_url') as string) || null
  const scheduled_for = formData.get('scheduled_for') as string
  const action_parameters_raw = formData.get('action_parameters') as string

  if (!type || !scheduled_for) {
    return { error: 'Type and scheduled time are required' }
  }

  let action_parameters = null
  if (action_parameters_raw) {
    try {
      action_parameters = JSON.parse(action_parameters_raw)
    } catch {
      return { error: 'Invalid action parameters JSON' }
    }
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert({ account_id, type, target_url, scheduled_for, action_parameters })
    .select('*, account:accounts(*)')
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateJobStatus(id: string, status: JobStatus) {
  const supabase = await createClient()

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'running') {
    updates.started_at = new Date().toISOString()
  } else if (status === 'success' || status === 'failed') {
    updates.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select('*, account:accounts(*)')
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deleteJob(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}

export async function getJobStats() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('jobs')
    .select('status')

  if (error) return { error: error.message }

  const stats = {
    total: data.length,
    pending: data.filter((j) => j.status === 'pending').length,
    running: data.filter((j) => j.status === 'running').length,
    success: data.filter((j) => j.status === 'success').length,
    failed: data.filter((j) => j.status === 'failed').length,
  }

  return { data: stats }
}

export async function getRecentJobs(limit: number = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('jobs')
    .select('*, account:accounts(*)')
    .order('scheduled_for', { ascending: false })
    .limit(limit)

  if (error) return { error: error.message }
  return { data }
}
