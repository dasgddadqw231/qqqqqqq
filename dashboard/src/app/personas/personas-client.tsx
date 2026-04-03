'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { BrainCircuit, Plus, MessageSquareText, Search, Users, Pencil, Trash2, Power } from 'lucide-react'
import { createPersona, updatePersona, deletePersona, togglePersona } from '@/app/actions/personas'
import type { Persona, Platform } from '@/lib/types'

interface PersonasClientProps {
    personas: Persona[]
}

export default function PersonasClient({ personas }: PersonasClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [search, setSearch] = useState('')
    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)

    // Form state
    const [formName, setFormName] = useState('')
    const [formPrompt, setFormPrompt] = useState('')
    const [formPlatform, setFormPlatform] = useState<string>('')
    const [formError, setFormError] = useState('')

    const filtered = personas.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.system_prompt.toLowerCase().includes(search.toLowerCase())
    )

    function resetForm() {
        setFormName('')
        setFormPrompt('')
        setFormPlatform('')
        setFormError('')
    }

    function openCreate() {
        resetForm()
        setCreateOpen(true)
    }

    function openEdit(persona: Persona) {
        setSelectedPersona(persona)
        setFormName(persona.name)
        setFormPrompt(persona.system_prompt)
        setFormPlatform(persona.platform ?? '')
        setFormError('')
        setEditOpen(true)
    }

    function openDelete(persona: Persona) {
        setSelectedPersona(persona)
        setDeleteOpen(true)
    }

    async function handleCreate() {
        const formData = new FormData()
        formData.append('name', formName)
        formData.append('system_prompt', formPrompt)
        if (formPlatform) formData.append('platform', formPlatform)

        startTransition(async () => {
            const result = await createPersona(formData)
            if (result.error) {
                setFormError(result.error)
                return
            }
            setCreateOpen(false)
            resetForm()
            router.refresh()
        })
    }

    async function handleUpdate() {
        if (!selectedPersona) return
        const formData = new FormData()
        formData.append('name', formName)
        formData.append('system_prompt', formPrompt)
        if (formPlatform) formData.append('platform', formPlatform)

        startTransition(async () => {
            const result = await updatePersona(selectedPersona.id, formData)
            if (result.error) {
                setFormError(result.error)
                return
            }
            setEditOpen(false)
            resetForm()
            router.refresh()
        })
    }

    async function handleDelete() {
        if (!selectedPersona) return
        startTransition(async () => {
            const result = await deletePersona(selectedPersona.id)
            if (result.error) {
                setFormError(result.error)
                return
            }
            setDeleteOpen(false)
            setSelectedPersona(null)
            router.refresh()
        })
    }

    async function handleToggle(persona: Persona) {
        startTransition(async () => {
            await togglePersona(persona.id, !persona.is_active)
            router.refresh()
        })
    }

    function getAccountCount(persona: Persona): number {
        if (!persona.accounts || persona.accounts.length === 0) return 0
        return persona.accounts[0].count
    }

    const platformColors: Record<string, string> = {
        instagram: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        threads: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        youtube: 'bg-red-500/10 text-red-400 border-red-500/20',
    }

    const formContent = (
        <div className="space-y-4">
            {formError && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {formError}
                </div>
            )}
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Name</label>
                <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Brand Advocate"
                    className="bg-zinc-950/50 border-white/10 text-white placeholder-zinc-500"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">System Prompt</label>
                <textarea
                    value={formPrompt}
                    onChange={(e) => setFormPrompt(e.target.value)}
                    placeholder="Describe the persona behavior..."
                    rows={4}
                    className="w-full rounded-lg bg-zinc-950/50 border border-white/10 text-white placeholder-zinc-500 px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 resize-none"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Platform</label>
                <Select value={formPlatform} onValueChange={(v) => setFormPlatform(v ?? '')}>
                    <SelectTrigger className="w-full bg-zinc-950/50 border-white/10 text-white">
                        <SelectValue placeholder="All platforms" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="threads">Threads</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )

    return (
        <div className="p-10 space-y-8 min-h-screen">
            {/* Header */}
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
                        <input
                            type="text"
                            placeholder="Search personas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-zinc-950/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white placeholder-zinc-500"
                        />
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-900/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Persona</span>
                    </button>
                </div>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((persona) => (
                    <Card key={persona.id} className="bg-zinc-900/40 border-white/5 backdrop-blur-sm group hover:border-purple-500/30 transition-all">
                        <CardHeader className="flex flex-row items-start justify-between pb-4">
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg group-hover:text-purple-400 transition-colors">{persona.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1.5">
                                    <Badge
                                        variant="outline"
                                        className={persona.is_active
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                        }
                                    >
                                        {persona.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {persona.platform && (
                                        <Badge variant="outline" className={platformColors[persona.platform] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}>
                                            {persona.platform.charAt(0).toUpperCase() + persona.platform.slice(1)}
                                        </Badge>
                                    )}
                                    {!persona.platform && (
                                        <span className="text-xs text-zinc-500">Cross-platform</span>
                                    )}
                                </CardDescription>
                            </div>
                            <div className="flex gap-1 ml-2 shrink-0">
                                <button
                                    onClick={() => handleToggle(persona)}
                                    disabled={isPending}
                                    className={`p-1.5 rounded-lg transition-colors ${persona.is_active
                                        ? 'text-emerald-400 hover:bg-emerald-500/10'
                                        : 'text-zinc-500 hover:bg-zinc-800'
                                        }`}
                                    title={persona.is_active ? 'Deactivate' : 'Activate'}
                                >
                                    <Power className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => openEdit(persona)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                                    title="Edit"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => openDelete(persona)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-zinc-950/50 p-4 rounded-xl border border-white/5 relative group-hover:border-purple-500/10 transition-colors">
                                <MessageSquareText className="w-4 h-4 text-zinc-600 mb-2" />
                                <p className="text-sm text-zinc-300 italic line-clamp-3">&ldquo;{persona.system_prompt}&rdquo;</p>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                    <Users className="w-4 h-4" />
                                    <span>{getAccountCount(persona)} assigned accounts</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* New persona card */}
                <button
                    onClick={openCreate}
                    className="h-full min-h-[250px] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-zinc-800 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                >
                    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:scale-110 transition-all">
                        <Plus className="w-6 h-6 text-zinc-500 group-hover:text-purple-400" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-medium text-zinc-300 group-hover:text-purple-300">New Persona Module</h3>
                        <p className="text-sm text-zinc-500 mt-1">Define systemic behavioral traits</p>
                    </div>
                </button>
            </div>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="bg-zinc-900 border-white/10 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">Create Persona</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Define a new AI behavior profile for comment generation.
                        </DialogDescription>
                    </DialogHeader>
                    {formContent}
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" className="border-white/10 text-zinc-300 hover:bg-zinc-800" />}>
                            Cancel
                        </DialogClose>
                        <Button
                            onClick={handleCreate}
                            disabled={isPending || !formName || !formPrompt}
                            className="bg-purple-600 hover:bg-purple-500 text-white"
                        >
                            {isPending ? 'Creating...' : 'Create Persona'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="bg-zinc-900 border-white/10 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">Edit Persona</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Update the persona configuration.
                        </DialogDescription>
                    </DialogHeader>
                    {formContent}
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" className="border-white/10 text-zinc-300 hover:bg-zinc-800" />}>
                            Cancel
                        </DialogClose>
                        <Button
                            onClick={handleUpdate}
                            disabled={isPending || !formName || !formPrompt}
                            className="bg-purple-600 hover:bg-purple-500 text-white"
                        >
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="bg-zinc-900 border-white/10 sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-white">Delete Persona</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Are you sure you want to delete <span className="font-medium text-white">{selectedPersona?.name}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {formError && (
                        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            {formError}
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" className="border-white/10 text-zinc-300 hover:bg-zinc-800" />}>
                            Cancel
                        </DialogClose>
                        <Button
                            onClick={handleDelete}
                            disabled={isPending}
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-500 text-white"
                        >
                            {isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
