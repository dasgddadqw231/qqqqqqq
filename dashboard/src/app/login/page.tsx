'use client'

import { useState } from 'react'
import { login } from './actions'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)

    async function handleLogin(formData: FormData) {
        const res = await login(formData)
        if (res?.error) {
            setError(res.error)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-900/30 blur-[120px] rounded-full" />
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-purple-900/20 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">NAUD</h1>
                        <p className="text-zinc-400 text-sm">Social-Flow Enterprise Command</p>
                    </div>

                    <form action={handleLogin} className="space-y-6">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1.5 ml-1">Email address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-950/50 border border-white/5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                                    placeholder="admin@naud.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1.5 ml-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-950/50 border border-white/5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3.5 px-4 bg-white text-zinc-950 font-semibold rounded-xl shadow-lg shadow-white/10 hover:bg-zinc-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Sign In to Command Center
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
