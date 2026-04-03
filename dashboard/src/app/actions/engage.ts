'use server'

import { createClient } from '@/utils/supabase/server'

interface EngagePost {
    url: string
    do_like: boolean
    do_repost: boolean
    comment_text: string | null
}

export async function createEngageTask(params: {
    channel: string
    profile_ids: string[]
    posts: EngagePost[]
    headless: boolean
}) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('engage_tasks')
        .insert({
            channel: params.channel,
            profile_ids: params.profile_ids,
            posts: params.posts,
            headless: params.headless,
            status: 'pending',
        })
        .select('id')
        .single()

    if (error) return { error: error.message }
    return { taskId: data.id }
}

export async function getEngageTask(taskId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('engage_tasks')
        .select('id, status, logs, error, created_at, started_at, completed_at')
        .eq('id', taskId)
        .single()

    if (error) return { error: error.message }
    return { data }
}
