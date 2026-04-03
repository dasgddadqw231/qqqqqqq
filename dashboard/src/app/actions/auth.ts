'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function checkDbConnection() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('proxies').select('id').limit(1)
    if (error) return { connected: false, error: error.message }
    return { connected: true }
  } catch (e) {
    return { connected: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
