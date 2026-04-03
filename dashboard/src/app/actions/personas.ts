'use server'

import { createClient } from '@/utils/supabase/server'
import type { Platform } from '@/lib/types'

export async function getPersonas() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('personas')
    .select('*, accounts(count)')
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data }
}

export async function getPersona(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('personas')
    .select('*, accounts(count)')
    .eq('id', id)
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function createPersona(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const system_prompt = formData.get('system_prompt') as string
  const platform = (formData.get('platform') as Platform) || null

  if (!name || !system_prompt) {
    return { error: 'Name and system prompt are required' }
  }

  const { data, error } = await supabase
    .from('personas')
    .insert({ name, system_prompt, platform })
    .select('*, accounts(count)')
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updatePersona(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const system_prompt = formData.get('system_prompt') as string
  const platform = (formData.get('platform') as Platform) || null

  if (!name || !system_prompt) {
    return { error: 'Name and system prompt are required' }
  }

  const { data, error } = await supabase
    .from('personas')
    .update({ name, system_prompt, platform, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, accounts(count)')
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deletePersona(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('personas')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}

export async function togglePersona(id: string, is_active: boolean) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('personas')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, accounts(count)')
    .single()

  if (error) return { error: error.message }
  return { data }
}
