'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { ProxyStatus } from '@/lib/types'

export async function getProxies() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proxies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data }
}

export async function createProxy(formData: FormData) {
  const supabase = await createClient()

  const ip = formData.get('ip') as string
  const port = Number(formData.get('port'))
  const username = (formData.get('username') as string) || null
  const password = (formData.get('password') as string) || null

  if (!ip || !port) {
    return { error: 'IP and port are required' }
  }

  const { error } = await supabase
    .from('proxies')
    .insert({ ip, port, username, password })

  if (error) return { error: error.message }

  revalidatePath('/proxies')
  return {}
}

export async function updateProxy(id: string, formData: FormData) {
  const supabase = await createClient()

  const ip = formData.get('ip') as string
  const port = Number(formData.get('port'))
  const username = (formData.get('username') as string) || null
  const password = (formData.get('password') as string) || null

  if (!ip || !port) {
    return { error: 'IP and port are required' }
  }

  const { error } = await supabase
    .from('proxies')
    .update({ ip, port, username, password })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/proxies')
  return {}
}

export async function deleteProxy(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('proxies')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/proxies')
  return {}
}

export async function updateProxyStatus(id: string, status: ProxyStatus) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('proxies')
    .update({ status, last_checked_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/proxies')
  return {}
}
