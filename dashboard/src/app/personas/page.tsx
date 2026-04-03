'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, BrainCircuit, MessageSquareText, Search } from "lucide-react"

export default function PersonasPage() {
    const personas = [
        { id: 1, name: 'Brand Advocate', prompt: 'You are an enthusiastic supporter of the product. Always highlight the positive features.', status: 'Active', profiles: 154, platform: 'Cross-platform' },
        { id: 2, name: 'Curious Buyer', prompt: 'You are interested but have questions. Ask about durability or shipping.', status: 'Active', profiles: 89, platform: 'Instagram' },
        { id: 3, name: 'Passive Scroller', prompt: 'You barely comment. Sometimes leave a short emoji or generic compliment like "Nice!".', status: 'Paused', profiles: 300, platform: 'Threads' },
        { id: 4, name: 'Technical Reviewer', prompt: 'You focus on specs. Ask deep technical questions about the implementation.', status: 'Active', profiles: 42, platform: 'YouTube' },
    ]

    return (
        <div className="p-10 space-y-8 min-h-screen">
            <header className="flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                        <BrainCircuit className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">AI Persona Matrix</h1>
                        <p className="text-sm text-zinc-400 mt-1">Configure Gemini LLM behaviors for behavior emulation.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input type="text" placeholder="Search personas..." className="bg-zinc-950/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white placeholder-zinc-500" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-900/20">
                        <Plus className="w-4 h-4" />
                        <span>Create Persona</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {personas.map((persona) => (
                    <Card key={persona.id} className="bg-zinc-900/40 border-white/5 backdrop-blur-sm group hover:border-purple-500/30 transition-all cursor-pointer">
                        <CardHeader className="flex flex-row items-start justify-between pb-4">
                            <div>
                                <CardTitle className="text-lg group-hover:text-purple-400 transition-colors">{persona.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1.5">
                                    <Badge variant="outline" className={`${persona.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                        }`}>
                                        {persona.status}
                                    </Badge>
                                    <span className="text-xs text-zinc-500">{persona.platform}</span>
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-zinc-950/50 p-4 rounded-xl border border-white/5 relative group-hover:border-purple-500/10 transition-colors">
                                <MessageSquareText className="w-4 h-4 text-zinc-600 mb-2" />
                                <p className="text-sm text-zinc-300 italic line-clamp-3">"{persona.prompt}"</p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                    <Users className="w-4 h-4" />
                                    <span>{persona.profiles} assigned profiles</span>
                                </div>
                                <button className="text-xs text-purple-400 hover:text-purple-300 font-medium">Edit Prompt &rarr;</button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <button className="h-full min-h-[250px] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-zinc-800 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:scale-110 transition-all">
                        <Plus className="w-6 h-6 text-zinc-500 group-hover:text-purple-400" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-medium text-zinc-300 group-hover:text-purple-300">New Persona Module</h3>
                        <p className="text-sm text-zinc-500 mt-1">Define systemic behavioral traits</p>
                    </div>
                </button>
            </div>
        </div>
    )
}
