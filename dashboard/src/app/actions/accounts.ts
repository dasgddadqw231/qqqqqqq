'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { Platform } from '@/lib/types'

export async function getAccounts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('accounts')
    .select('*, proxy:proxies(*), persona:personas(*)')
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data }
}

export async function createAccount(formData: FormData) {
  const supabase = await createClient()

  const platform = formData.get('platform') as Platform
  const username = formData.get('username') as string
  const adspower_id = (formData.get('adspower_id') as string) || null
  const proxy_id = (formData.get('proxy_id') as string) || null
  const persona_id = (formData.get('persona_id') as string) || null

  if (!platform || !username) {
    return { error: 'Platform and username are required' }
  }

  const { error } = await supabase
    .from('accounts')
    .insert({ platform, username, adspower_id, proxy_id, persona_id })

  if (error) return { error: error.message }

  revalidatePath('/accounts')
  return {}
}

export async function updateAccount(id: string, formData: FormData) {
  const supabase = await createClient()

  const platform = formData.get('platform') as Platform
  const username = formData.get('username') as string
  const adspower_id = (formData.get('adspower_id') as string) || null
  const proxy_id = (formData.get('proxy_id') as string) || null
  const persona_id = (formData.get('persona_id') as string) || null

  if (!platform || !username) {
    return { error: 'Platform and username are required' }
  }

  const { error } = await supabase
    .from('accounts')
    .update({ platform, username, adspower_id, proxy_id, persona_id, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/accounts')
  return {}
}

export async function deleteAccount(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/accounts')
  return {}
}

export async function toggleAccount(id: string, is_active: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('accounts')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/accounts')
  return {}
}
