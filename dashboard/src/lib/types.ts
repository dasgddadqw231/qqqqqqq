export type Platform = 'instagram' | 'threads' | 'youtube'
export type JobType = 'watch_reels' | 'story_share' | 'auto_reply' | 'threads_dwell' | 'threads_repost' | 'youtube_watch' | 'youtube_comment'
export type JobStatus = 'pending' | 'running' | 'success' | 'failed'
export type ProxyStatus = 'active' | 'failing' | 'dead'

export interface Persona {
    id: string
    name: string
    system_prompt: string
    platform: Platform | null
    is_active: boolean
    created_at: string
    updated_at: string
    accounts?: { count: number }[]
}

export interface Proxy {
    id: string
    ip: string
    port: number
    username: string | null
    password: string | null
    status: ProxyStatus
    last_checked_at: string
    created_at: string
}

export interface Account {
    id: string
    platform: Platform
    username: string
    adspower_id: string | null
    proxy_id: string | null
    persona_id: string | null
    is_active: boolean
    created_at: string
    updated_at: string
    proxy?: Proxy | null
    persona?: Persona | null
}

export interface Job {
    id: string
    account_id: string | null
    type: JobType
    status: JobStatus
    target_url: string | null
    action_parameters: Record<string, unknown> | null
    ai_generated_content: string | null
    scheduled_for: string
    started_at: string | null
    completed_at: string | null
    error_log: string | null
    created_at: string
    updated_at: string
    account?: Account | null
}

export interface EngageTask {
    id: string
    channel: string
    profile_ids: string[]
    posts: Record<string, unknown>[]
    headless: boolean
    status: JobStatus
    logs: string[]
    error: string | null
    created_at: string
    started_at: string | null
    completed_at: string | null
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
    watch_reels: 'Watch Reels',
    story_share: 'Story Share',
    auto_reply: 'Auto Reply',
    threads_dwell: 'Threads Dwell',
    threads_repost: 'Threads Repost',
    youtube_watch: 'YouTube Watch',
    youtube_comment: 'YouTube Comment',
}

export const PLATFORM_LABELS: Record<Platform, string> = {
    instagram: 'Instagram',
    threads: 'Threads',
    youtube: 'YouTube',
}
