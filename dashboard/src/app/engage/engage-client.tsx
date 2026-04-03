'use client'

import { useState, useRef } from 'react'
import { Play, Plus, Trash2, Heart, MessageCircle, Repeat2, Loader2, CheckCircle2, XCircle, Link, Users, Check, Eye, Clock, Share2, MonitorOff } from 'lucide-react'
import type { Account } from '@/lib/types'

type Channel = 'threads' | 'instagram' | 'youtube'

const CHANNELS: { key: Channel; label: string; color: string; activeColor: string }[] = [
    { key: 'threads', label: 'Threads', color: 'text-zinc-400', activeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    { key: 'instagram', label: 'Instagram', color: 'text-zinc-400', activeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
    { key: 'youtube', label: 'YouTube', color: 'text-zinc-400', activeColor: 'bg-red-500/10 text-red-400 border-red-500/30' },
]

// 채널별 작업 옵션 정의
const CHANNEL_ACTIONS: Record<Channel, { key: string; label: string; icon: 'like' | 'repost' | 'comment' | 'watch' | 'share'; defaultOn: boolean }[]> = {
    threads: [
        { key: 'do_like', label: '좋아요', icon: 'like', defaultOn: true },
        { key: 'do_repost', label: '리포스트', icon: 'repost', defaultOn: true },
        { key: 'comment_text', label: '댓글', icon: 'comment', defaultOn: false },
    ],
    instagram: [
        { key: 'do_watch', label: '시청', icon: 'watch', defaultOn: true },
        { key: 'do_like', label: '좋아요', icon: 'like', defaultOn: true },
        { key: 'comment_text', label: '댓글', icon: 'comment', defaultOn: false },
        { key: 'do_share', label: '스토리 공유', icon: 'share', defaultOn: false },
    ],
    youtube: [
        { key: 'do_watch', label: '시청', icon: 'watch', defaultOn: true },
        { key: 'do_like', label: '좋아요', icon: 'like', defaultOn: true },
        { key: 'comment_text', label: '댓글', icon: 'comment', defaultOn: false },
    ],
}

const URL_PLACEHOLDERS: Record<Channel, string> = {
    threads: 'https://www.threads.com/@user/post/...',
    instagram: 'https://www.instagram.com/p/... 또는 /reel/...',
    youtube: 'https://www.youtube.com/watch?v=...',
}

interface Post {
    id: string
    url: string
    actions: Record<string, boolean | string>
}

function createEmptyPost(channel: Channel): Post {
    const actions: Record<string, boolean | string> = {}
    for (const act of CHANNEL_ACTIONS[channel]) {
        actions[act.key] = act.key === 'comment_text' ? '' : act.defaultOn
    }
    return { id: crypto.randomUUID(), url: '', actions }
}

type Status = 'idle' | 'running' | 'success' | 'error'

const ACTION_ICON_MAP = {
    like: { Icon: Heart, onClass: 'bg-pink-500/10 text-pink-400 border-pink-500/20', fillClass: 'fill-pink-400' },
    repost: { Icon: Repeat2, onClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', fillClass: '' },
    watch: { Icon: Eye, onClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20', fillClass: '' },
    share: { Icon: Share2, onClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20', fillClass: '' },
    comment: { Icon: MessageCircle, onClass: '', fillClass: '' },
}

export default function EngageClient({ accounts }: { accounts: Account[] }) {
    const [channel, setChannel] = useState<Channel>('threads')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [posts, setPosts] = useState<Post[]>([createEmptyPost('threads')])
    const [status, setStatus] = useState<Status>('idle')
    const [headless, setHeadless] = useState(false)
    const [logs, setLogs] = useState<string[]>([])
    const logsEndRef = useRef<HTMLDivElement>(null)

    // ── 채널 전환 ──
    const switchChannel = (ch: Channel) => {
        setChannel(ch)
        setPosts([createEmptyPost(ch)])
        setLogs([])
        setStatus('idle')
    }

    // ── 프로필 선택 ──
    const toggleProfile = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const toggleAll = () => {
        if (selectedIds.size === accounts.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(accounts.map(a => a.id)))
        }
    }

    const allSelected = accounts.length > 0 && selectedIds.size === accounts.length

    // ── 게시물 관리 ──
    const updatePost = (id: string, updates: Partial<Post>) => {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    }

    const updatePostAction = (id: string, key: string, value: boolean | string) => {
        setPosts(prev => prev.map(p =>
            p.id === id ? { ...p, actions: { ...p.actions, [key]: value } } : p
        ))
    }

    const removePost = (id: string) => {
        setPosts(prev => prev.length > 1 ? prev.filter(p => p.id !== id) : prev)
    }

    const addPost = () => {
        setPosts(prev => [...prev, createEmptyPost(channel)])
    }

    // ── 실행 ──
    const isImplemented = channel === 'threads'

    const canRun =
        isImplemented &&
        selectedIds.size > 0 &&
        posts.some(p => p.url.trim() !== '') &&
        status !== 'running'

    const runEngage = async () => {
        const selectedAccounts = accounts.filter(a => selectedIds.has(a.id))
        const profileIds = selectedAccounts.map(a => a.adspower_id!).filter(Boolean)
        const validPosts = posts
            .filter(p => p.url.trim() !== '')
            .map(p => ({
                url: p.url.trim(),
                do_like: p.actions.do_like === true,
                do_repost: p.actions.do_repost === true,
                comment_text: (p.actions.comment_text as string)?.trim() || null,
            }))

        if (profileIds.length === 0 || validPosts.length === 0) return

        setStatus('running')
        setLogs([`${profileIds.length}개 프로필 × ${validPosts.length}개 게시물 작업 시작...`])

        try {
            const res = await fetch('/api/engage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channel, profile_ids: profileIds, posts: validPosts, headless }),
            })

            const data = await res.json()
            setLogs(data.logs || [])
            setStatus(data.success ? 'success' : 'error')
        } catch (err) {
            setLogs(prev => [...prev, `네트워크 오류: ${err}`])
            setStatus('error')
        }
    }

    const channelConfig = CHANNELS.find(c => c.key === channel)!
    const actions = CHANNEL_ACTIONS[channel]

    return (
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Engage</h1>
                <p className="text-zinc-500 text-sm mt-1">프로필을 선택하고 게시물에 작업을 실행합니다</p>
            </div>

            {/* Channel Tabs */}
            <div className="flex items-center gap-1 bg-zinc-900/60 border border-white/5 rounded-xl p-1 mb-4 lg:mb-6">
                {CHANNELS.map(ch => (
                    <button
                        key={ch.key}
                        onClick={() => switchChannel(ch.key)}
                        className={`flex-1 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                            channel === ch.key
                                ? ch.activeColor
                                : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        {ch.label}
                    </button>
                ))}
            </div>

            {/* Profile Selection */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 lg:p-4 mb-4 lg:mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm font-medium text-zinc-400">프로필 선택</span>
                        <span className="text-xs text-zinc-600">({selectedIds.size}/{accounts.length})</span>
                    </div>
                    <button
                        onClick={toggleAll}
                        className={`text-xs px-3 py-1 rounded-lg transition-all ${
                            allSelected
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'text-zinc-500 hover:text-zinc-300 border border-white/5 hover:border-white/10'
                        }`}
                    >
                        {allSelected ? '전체 해제' : '전체 선택'}
                    </button>
                </div>

                {accounts.length === 0 ? (
                    <p className="text-zinc-600 text-sm">AdsPower 프로필이 연결된 활성 계정이 없습니다</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {accounts.map(account => {
                            const selected = selectedIds.has(account.id)
                            return (
                                <button
                                    key={account.id}
                                    onClick={() => toggleProfile(account.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                                        selected
                                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                                            : 'bg-zinc-800/50 text-zinc-500 border border-white/5 hover:text-zinc-300 hover:border-white/10'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                        selected ? 'bg-blue-500 border-blue-500' : 'border-zinc-600'
                                    }`}>
                                        {selected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="font-medium">{account.username}</span>
                                    <span className="text-xs text-zinc-600 font-mono hidden sm:inline">{account.adspower_id}</span>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Post List */}
            <div className="space-y-3 mb-4 lg:mb-6">
                {posts.map((post, idx) => (
                    <div key={post.id} className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 lg:p-4 space-y-3">
                        <div className="flex items-center gap-2 lg:gap-3">
                            <span className="text-zinc-600 text-xs font-mono w-5 text-right shrink-0">{idx + 1}</span>
                            <div className="relative flex-1 min-w-0">
                                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input
                                    type="url"
                                    placeholder={URL_PLACEHOLDERS[channel]}
                                    value={post.url}
                                    onChange={e => updatePost(post.id, { url: e.target.value })}
                                    className="w-full bg-zinc-800/50 border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => removePost(post.id)}
                                disabled={posts.length === 1}
                                className="p-2 text-zinc-600 hover:text-red-400 disabled:opacity-20 disabled:hover:text-zinc-600 transition-colors shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:gap-4 ml-0 lg:ml-8">
                            {actions.map(act => {
                                if (act.icon === 'comment') {
                                    return (
                                        <div key={act.key} className="flex items-center gap-1.5 flex-1">
                                            <MessageCircle className={`w-3.5 h-3.5 flex-shrink-0 ${(post.actions.comment_text as string) ? 'text-blue-400' : 'text-zinc-600'}`} />
                                            <input
                                                type="text"
                                                placeholder="댓글 내용 (선택)"
                                                value={(post.actions.comment_text as string) || ''}
                                                onChange={e => updatePostAction(post.id, 'comment_text', e.target.value)}
                                                className="flex-1 bg-transparent border-b border-white/5 px-2 py-1 text-xs placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                                            />
                                        </div>
                                    )
                                }

                                const iconDef = ACTION_ICON_MAP[act.icon]
                                const isOn = post.actions[act.key] === true

                                return (
                                    <button
                                        key={act.key}
                                        onClick={() => updatePostAction(post.id, act.key, !isOn)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            isOn
                                                ? iconDef.onClass
                                                : 'bg-zinc-800/50 text-zinc-600 border border-white/5 hover:text-zinc-400'
                                        }`}
                                    >
                                        <iconDef.Icon className={`w-3.5 h-3.5 ${isOn && iconDef.fillClass ? iconDef.fillClass : ''}`} />
                                        {act.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add + Run */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={addPost}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-white/5 text-zinc-400 hover:text-white hover:border-white/10 transition-all text-sm"
                >
                    <Plus className="w-4 h-4" />
                    게시물 추가
                </button>

                <button
                    onClick={runEngage}
                    disabled={!canRun}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
                >
                    {status === 'running' ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            실행 중...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            실행
                        </>
                    )}
                </button>

                <button
                    onClick={() => setHeadless(h => !h)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        headless
                            ? 'bg-violet-500/10 text-violet-400 border border-violet-500/30'
                            : 'bg-zinc-900/60 text-zinc-500 border border-white/5 hover:text-zinc-300 hover:border-white/10'
                    }`}
                >
                    <MonitorOff className="w-3.5 h-3.5" />
                    백그라운드
                </button>

                {!isImplemented && (
                    <span className="text-xs text-zinc-600">
                        {channelConfig.label} 엔진은 준비 중입니다
                    </span>
                )}
            </div>

            {/* Logs */}
            {logs.length > 0 && (
                <div className="mt-8">
                    <div className="flex items-center gap-2 mb-3">
                        {status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {status === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
                        {status === 'running' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                        <span className="text-sm font-medium text-zinc-400">실행 로그</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-xl p-4 max-h-80 overflow-y-auto font-mono text-xs space-y-0.5">
                        {logs.map((line, i) => (
                            <div
                                key={i}
                                className={
                                    line.includes('DONE:') ? 'text-emerald-400' :
                                    line.includes('ERROR') || line.includes('[stderr]') ? 'text-red-400' :
                                    line.includes('완료') ? 'text-blue-400' :
                                    'text-zinc-400'
                                }
                            >
                                {line}
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            )}
        </div>
    )
}
