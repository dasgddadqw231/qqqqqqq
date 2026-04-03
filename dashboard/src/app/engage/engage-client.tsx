'use client'

import { useState, useRef } from 'react'
import { Play, Plus, Trash2, Heart, MessageCircle, Repeat2, Loader2, CheckCircle2, XCircle, Link, User } from 'lucide-react'

interface Task {
    id: string
    post_url: string
    do_like: boolean
    do_repost: boolean
    comment_text: string
}

function createEmptyTask(): Task {
    return {
        id: crypto.randomUUID(),
        post_url: '',
        do_like: true,
        do_repost: true,
        comment_text: '',
    }
}

type Status = 'idle' | 'running' | 'success' | 'error'

export default function EngageClient() {
    const [profileId, setProfileId] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [tasks, setTasks] = useState<Task[]>([createEmptyTask()])
    const [status, setStatus] = useState<Status>('idle')
    const [logs, setLogs] = useState<string[]>([])
    const logsEndRef = useRef<HTMLDivElement>(null)

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    }

    const removeTask = (id: string) => {
        setTasks(prev => prev.length > 1 ? prev.filter(t => t.id !== id) : prev)
    }

    const addTask = () => {
        setTasks(prev => [...prev, createEmptyTask()])
    }

    const canRun =
        profileId.trim() !== '' &&
        username.trim() !== '' &&
        password.trim() !== '' &&
        tasks.some(t => t.post_url.trim() !== '') &&
        status !== 'running'

    const runEngage = async () => {
        const validTasks = tasks
            .filter(t => t.post_url.trim() !== '')
            .map(t => ({
                profile_id: profileId.trim(),
                username: username.trim(),
                password: password.trim(),
                post_url: t.post_url.trim(),
                do_like: t.do_like,
                do_repost: t.do_repost,
                comment_text: t.comment_text.trim() || null,
            }))

        if (validTasks.length === 0) return

        setStatus('running')
        setLogs(['작업 시작 중...'])

        try {
            const res = await fetch('/api/engage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasks: validTasks }),
            })

            const data = await res.json()
            setLogs(data.logs || [])
            setStatus(data.success ? 'success' : 'error')
        } catch (err) {
            setLogs(prev => [...prev, `네트워크 오류: ${err}`])
            setStatus('error')
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Engage</h1>
                <p className="text-zinc-500 text-sm mt-1">Threads 게시물에 좋아요, 리포스트, 댓글 작업을 실행합니다</p>
            </div>

            {/* Account Section */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm font-medium text-zinc-400">계정 정보</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <input
                        type="text"
                        placeholder="AdsPower Profile ID"
                        value={profileId}
                        onChange={e => setProfileId(e.target.value)}
                        className="bg-zinc-800/50 border border-white/5 rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                    <input
                        type="text"
                        placeholder="Username / Email"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="bg-zinc-800/50 border border-white/5 rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-zinc-800/50 border border-white/5 rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-3 mb-6">
                {tasks.map((task, idx) => (
                    <div key={task.id} className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-3">
                        {/* URL Input Row */}
                        <div className="flex items-center gap-3">
                            <span className="text-zinc-600 text-xs font-mono w-5 text-right">{idx + 1}</span>
                            <div className="relative flex-1">
                                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input
                                    type="url"
                                    placeholder="https://www.threads.com/@user/post/..."
                                    value={task.post_url}
                                    onChange={e => updateTask(task.id, { post_url: e.target.value })}
                                    className="w-full bg-zinc-800/50 border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => removeTask(task.id)}
                                disabled={tasks.length === 1}
                                className="p-2 text-zinc-600 hover:text-red-400 disabled:opacity-20 disabled:hover:text-zinc-600 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center gap-4 ml-8">
                            <button
                                onClick={() => updateTask(task.id, { do_like: !task.do_like })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    task.do_like
                                        ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                                        : 'bg-zinc-800/50 text-zinc-600 border border-white/5 hover:text-zinc-400'
                                }`}
                            >
                                <Heart className={`w-3.5 h-3.5 ${task.do_like ? 'fill-pink-400' : ''}`} />
                                좋아요
                            </button>

                            <button
                                onClick={() => updateTask(task.id, { do_repost: !task.do_repost })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    task.do_repost
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-zinc-800/50 text-zinc-600 border border-white/5 hover:text-zinc-400'
                                }`}
                            >
                                <Repeat2 className="w-3.5 h-3.5" />
                                리포스트
                            </button>

                            <div className="flex items-center gap-1.5 flex-1">
                                <MessageCircle className={`w-3.5 h-3.5 flex-shrink-0 ${task.comment_text ? 'text-blue-400' : 'text-zinc-600'}`} />
                                <input
                                    type="text"
                                    placeholder="댓글 내용 (선택)"
                                    value={task.comment_text}
                                    onChange={e => updateTask(task.id, { comment_text: e.target.value })}
                                    className="flex-1 bg-transparent border-b border-white/5 px-2 py-1 text-xs placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add + Run Buttons */}
            <div className="flex items-center gap-3">
                <button
                    onClick={addTask}
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
