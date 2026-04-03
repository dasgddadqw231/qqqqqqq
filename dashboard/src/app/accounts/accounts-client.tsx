'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Power, Loader2, RefreshCw } from 'lucide-react'
import type { Account, Persona, Proxy, Platform } from '@/lib/types'
import { PLATFORM_LABELS } from '@/lib/types'
import { createAccount, updateAccount, deleteAccount, toggleAccount } from '@/app/actions/accounts'
import { syncAdsPowerProfiles } from '@/app/actions/adspower-sync'

const PLATFORMS: Platform[] = ['instagram', 'threads', 'youtube']

export default function AccountsClient({
    accounts,
    personas,
    proxies,
}: {
    accounts: Account[]
    personas: Persona[]
    proxies: Proxy[]
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Filter
    const [filterPlatform, setFilterPlatform] = useState<string>('all')

    // Dialog state
    const [addOpen, setAddOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<Account | null>(null)

    // Form state
    const [formUsername, setFormUsername] = useState('')
    const [formPlatform, setFormPlatform] = useState<string>('')
    const [formAdspowerId, setFormAdspowerId] = useState('')
    const [formProxyId, setFormProxyId] = useState<string>('')
    const [formPersonaId, setFormPersonaId] = useState<string>('')
    const [formError, setFormError] = useState('')

    const filteredAccounts = filterPlatform === 'all'
        ? accounts
        : accounts.filter((a) => a.platform === filterPlatform)

    function resetForm() {
        setFormUsername('')
        setFormPlatform('')
        setFormAdspowerId('')
        setFormProxyId('')
        setFormPersonaId('')
        setFormError('')
    }

    function openEditDialog(acc: Account) {
        setEditingAccount(acc)
        setFormUsername(acc.username)
        setFormPlatform(acc.platform)
        setFormAdspowerId(acc.adspower_id || '')
        setFormProxyId(acc.proxy_id || '')
        setFormPersonaId(acc.persona_id || '')
        setFormError('')
        setEditOpen(true)
    }

    async function handleCreate() {
        setFormError('')
        if (!formUsername || !formPlatform) {
            setFormError('Username and platform are required')
            return
        }
        const fd = new FormData()
        fd.set('username', formUsername)
        fd.set('platform', formPlatform)
        if (formAdspowerId) fd.set('adspower_id', formAdspowerId)
        if (formProxyId) fd.set('proxy_id', formProxyId)
        if (formPersonaId) fd.set('persona_id', formPersonaId)

        const result = await createAccount(fd)
        if (result.error) {
            setFormError(result.error)
            return
        }
        setAddOpen(false)
        resetForm()
        startTransition(() => router.refresh())
    }

    async function handleUpdate() {
        if (!editingAccount) return
        setFormError('')
        if (!formUsername || !formPlatform) {
            setFormError('Username and platform are required')
            return
        }
        const fd = new FormData()
        fd.set('username', formUsername)
        fd.set('platform', formPlatform)
        if (formAdspowerId) fd.set('adspower_id', formAdspowerId)
        if (formProxyId) fd.set('proxy_id', formProxyId)
        if (formPersonaId) fd.set('persona_id', formPersonaId)

        const result = await updateAccount(editingAccount.id, fd)
        if (result.error) {
            setFormError(result.error)
            return
        }
        setEditOpen(false)
        setEditingAccount(null)
        resetForm()
        startTransition(() => router.refresh())
    }

    async function handleDelete(id: string) {
        const result = await deleteAccount(id)
        if (!result.error) {
            startTransition(() => router.refresh())
        }
    }

    async function handleToggle(id: string, currentActive: boolean) {
        const result = await toggleAccount(id, !currentActive)
        if (!result.error) {
            startTransition(() => router.refresh())
        }
    }

    const accountFormFields = (
        <div className="space-y-4 py-2">
            {formError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {formError}
                </p>
            )}
            {/* Username */}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Username *</label>
                <Input
                    placeholder="@username"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-500"
                />
            </div>
            {/* Platform */}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Platform *</label>
                <Select value={formPlatform} onValueChange={(v) => setFormPlatform(v ?? '')}>
                    <SelectTrigger className="w-full bg-zinc-800/50 border-white/10 text-white">
                        <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-white/10 text-white">
                        {PLATFORMS.map((p) => (
                            <SelectItem key={p} value={p}>
                                {PLATFORM_LABELS[p]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {/* AdsPower ID */}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">AdsPower ID</label>
                <Input
                    placeholder="AdsPower browser profile ID"
                    value={formAdspowerId}
                    onChange={(e) => setFormAdspowerId(e.target.value)}
                    className="bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-500"
                />
            </div>
            {/* Proxy */}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Proxy</label>
                <Select value={formProxyId} onValueChange={(v) => setFormProxyId(v ?? '')}>
                    <SelectTrigger className="w-full bg-zinc-800/50 border-white/10 text-white">
                        <SelectValue placeholder="Select proxy (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-white/10 text-white">
                        {proxies.map((px) => (
                            <SelectItem key={px.id} value={px.id}>
                                {px.ip}:{px.port}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {/* Persona */}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Persona</label>
                <Select value={formPersonaId} onValueChange={(v) => setFormPersonaId(v ?? '')}>
                    <SelectTrigger className="w-full bg-zinc-800/50 border-white/10 text-white">
                        <SelectValue placeholder="Select persona (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-white/10 text-white">
                        {personas.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )

    return (
        <div className="p-10 space-y-8 min-h-screen">
            {/* Header */}
            <header className="flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Account Management
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Manage social accounts, proxies, and persona assignments.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {isPending && (
                        <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                    )}
                    <Button
                        variant="outline"
                        className="border-white/10 text-zinc-400 hover:text-white rounded-xl h-10 px-4 gap-2"
                        onClick={async () => {
                            const result = await syncAdsPowerProfiles()
                            startTransition(() => router.refresh())
                        }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Sync AdsPower
                    </Button>
                    <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger
                            render={
                                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-900/20 h-10 px-4 gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Account
                                </Button>
                            }
                        />
                        <DialogContent className="bg-zinc-900 border border-white/10 text-white sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-white">Add Account</DialogTitle>
                            </DialogHeader>
                            {accountFormFields}
                            <DialogFooter className="bg-zinc-800/50 border-white/5">
                                <Button
                                    onClick={handleCreate}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
                                    Create Account
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* Filter */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500 mr-2">Filter:</span>
                <Button
                    variant={filterPlatform === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterPlatform('all')}
                    className={filterPlatform === 'all' ? 'bg-emerald-600 text-white' : 'border-white/10 text-zinc-400 hover:text-white'}
                >
                    All
                </Button>
                {PLATFORMS.map((p) => (
                    <Button
                        key={p}
                        variant={filterPlatform === p ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterPlatform(p)}
                        className={filterPlatform === p ? 'bg-emerald-600 text-white' : 'border-white/10 text-zinc-400 hover:text-white'}
                    >
                        {PLATFORM_LABELS[p]}
                    </Button>
                ))}
                <span className="ml-auto text-xs text-zinc-500">
                    {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Table */}
            <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Username</TableHead>
                                <TableHead className="text-zinc-400">Platform</TableHead>
                                <TableHead className="text-zinc-400">Persona</TableHead>
                                <TableHead className="text-zinc-400">Proxy</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAccounts.length === 0 ? (
                                <TableRow className="border-white/5">
                                    <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                                        No accounts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAccounts.map((acc) => (
                                    <TableRow key={acc.id} className="border-white/5 hover:bg-zinc-800/30">
                                        <TableCell className="text-white font-medium">
                                            @{acc.username}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    acc.platform === 'instagram'
                                                        ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                                                        : acc.platform === 'threads'
                                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }
                                            >
                                                {PLATFORM_LABELS[acc.platform]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-400">
                                            {acc.persona?.name || <span className="text-zinc-600">--</span>}
                                        </TableCell>
                                        <TableCell className="text-zinc-400 font-mono text-xs">
                                            {acc.proxy ? `${acc.proxy.ip}` : <span className="text-zinc-600">--</span>}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                                                    acc.is_active
                                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${acc.is_active ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                                                {acc.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleToggle(acc.id, acc.is_active)}
                                                    className={acc.is_active ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-500/10'}
                                                >
                                                    <Power className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => openEditDialog(acc)}
                                                    className="text-zinc-400 hover:text-white hover:bg-zinc-500/10"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleDelete(acc.id)}
                                                    className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { setEditingAccount(null); resetForm(); } }}>
                <DialogContent className="bg-zinc-900 border border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">Edit Account</DialogTitle>
                    </DialogHeader>
                    {accountFormFields}
                    <DialogFooter className="bg-zinc-800/50 border-white/5">
                        <Button
                            onClick={handleUpdate}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
