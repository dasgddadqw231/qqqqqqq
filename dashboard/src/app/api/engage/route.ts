import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export const maxDuration = 300

interface PostTask {
    url: string
    do_like: boolean
    do_repost: boolean
    comment_text: string | null
}

export async function POST(req: NextRequest) {
    const body: { profile_ids: string[]; posts: PostTask[]; headless?: boolean } = await req.json()
    const { profile_ids, posts, headless } = body

    if (!profile_ids?.length || !posts?.length) {
        return NextResponse.json({ error: 'profile_ids and posts are required' }, { status: 400 })
    }

    const engineDir = path.resolve(process.cwd(), '..', 'engine')
    const payload = JSON.stringify({ profile_ids, posts, headless: headless ?? false })

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
            resolve(NextResponse.json({ success, exit_code: code, logs }))
        })

        child.on('error', (err) => {
            resolve(NextResponse.json({ success: false, error: err.message, logs }, { status: 500 }))
        })

        setTimeout(() => {
            child.kill()
            resolve(NextResponse.json({ success: false, error: 'Timeout (5min)', logs }, { status: 504 }))
        }, 300_000)
    })
}
