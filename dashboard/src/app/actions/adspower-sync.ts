'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

const ADSPOWER_BASE = process.env.ADSPOWER_BASE || 'http://local.adspower.net:50325'
const ADSPOWER_API_KEY = process.env.ADSPOWER_API_KEY || ''

async function adspowerGet(path: string, params?: Record<string, string>) {
  const url = new URL(`${ADSPOWER_BASE}${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${ADSPOWER_API_KEY}` },
    cache: 'no-store',
  })
  const data = await res.json()
  if (data.code !== 0) throw new Error(data.msg)
  return data
}

export async function syncAdsPowerProfiles() {
  try {
    // 1) AdsPower에서 전체 프로필 가져오기
    const adsData = await adspowerGet('/api/v1/user/list', { page: '1', page_size: '100' })
    const adsProfiles: Array<{ user_id: string; name: string }> = adsData.data.list

    if (adsProfiles.length === 0) {
      return { data: { synced: 0, total: 0 } }
    }

    // 2) Supabase에서 기존 accounts 조회
    const supabase = await createClient()
    const { data: existingAccounts } = await supabase
      .from('accounts')
      .select('id, adspower_id')

    const existingAdspowerIds = new Set(
      (existingAccounts || []).map((a) => a.adspower_id).filter(Boolean)
    )

    // 3) 새 프로필만 Supabase에 추가
    const newProfiles = adsProfiles.filter((p) => !existingAdspowerIds.has(p.user_id))

    if (newProfiles.length > 0) {
      const rows = newProfiles.map((p) => ({
        platform: 'threads' as const,
        username: p.name,
        adspower_id: p.user_id,
        is_active: true,
      }))

      const { error } = await supabase.from('accounts').insert(rows)
      if (error) return { error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/accounts')
    return { data: { synced: newProfiles.length, total: adsProfiles.length } }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Sync failed' }
  }
}
