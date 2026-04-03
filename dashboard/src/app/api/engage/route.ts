import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export const maxDuration = 300

interface EngageTask {
    profile_id: string
    username: string
    password: string
    post_url: string
    do_like: boolean
    do_repost: boolean
    comment_text: string | null
}

export async function POST(req: NextRequest) {
    const body: { tasks: EngageTask[] } = await req.json()
    const { tasks } = body

    if (!tasks || tasks.length === 0) {
        return NextResponse.json({ error: 'No tasks provided' }, { status: 400 })
    }

    // 필수값 검증
    const first = tasks[0]
    if (!first.profile_id || !first.username || !first.password) {
        return NextResponse.json({ error: 'profile_id, username, password are required' }, { status: 400 })
    }

    const engineDir = path.resolve(process.cwd(), '..', 'engine')
    const payload = JSON.stringify(tasks)

    // AdsPower 환경변수를 엔진에 전달
    const env = {
        ...process.env,
        ADSPOWER_BASE: process.env.ADSPOWER_BASE || 'http://local.adspower.net:50325',
        ADSPOWER_API_KEY: process.env.ADSPOWER_API_KEY || '',
    }

    return new Promise<NextResponse>((resolve) => {
        const logs: string[] = []
        const child = spawn('python3', ['engage.py', payload], {
            cwd: engineDir,
            env,
        })

        child.stdout.on('data', (data: Buffer) => {
            const lines = data.toString().split('\n').filter(Boolean)
            logs.push(...lines)
        })

        child.stderr.on('data', (data: Buffer) => {
            const lines = data.toString().split('\n').filter(Boolean)
            logs.push(...lines.map(l => `[stderr] ${l}`))
        })

        child.on('close', (code) => {
            const success = code === 0 && logs.some(l => l.includes('DONE:'))
            resolve(NextResponse.json({
                success,
                exit_code: code,
                logs,
            }))
        })

        child.on('error', (err) => {
            resolve(NextResponse.json({
                success: false,
                error: err.message,
                logs,
            }, { status: 500 }))
        })

        setTimeout(() => {
            child.kill()
            resolve(NextResponse.json({
                success: false,
                error: 'Timeout (5min)',
                logs,
            }, { status: 504 }))
        }, 300_000)
    })
}
