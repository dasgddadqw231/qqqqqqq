'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
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
import type { Account, Persona, Proxy } from '@/lib/types'
import { createAccount, updateAccount, deleteAccount, toggleAccount } from '@/app/actions/accounts'
import { syncAdsPowerProfiles } from '@/app/actions/adspower-sync'

export default function AccountsClient({
    accounts: initialAccounts,
    personas,
    proxies,
}: {
    accounts: Account[]
    personas: Persona[]
    proxies: Proxy[]
}) {
    const router = useRouter()
    const [accounts, setAccounts] = useState(initialAccounts)
    const [syncing, setSyncing] = useState(false)

    // Dialog state
    const [addOpen, setAddOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<Account | null>(null)

    // Form state
    const [formUsername, setFormUsername] = useState('')
    const [formAdspowerId, setFormAdspowerId] = useState('')
    const [formProxyId, setFormProxyId] = useState<string>('')
    const [formPersonaId, setFormPersonaId] = useState<string>('')
    const [formError, setFormError] = useState('')

    function resetForm() {
        setFormUsername('')
        setFormAdspowerId('')
        setFormProxyId('')
        setFormPersonaId('')
        setFormError('')
    }

    function openEditDialog(acc: Account) {
        setEditingAccount(acc)
        setFormUsername(acc.username)
        setFormAdspowerId(acc.adspower_id || '')
        setFormProxyId(acc.proxy_id || '')
        setFormPersonaId(acc.persona_id || '')
        setFormError('')
        setEditOpen(true)
    }

    async function handleCreate() {
        setFormError('')
        if (!formUsername) {
            setFormError('Username is required')
            return
        }
        const fd = new FormData()
        fd.set('username', formUsername)
        fd.set('platform', 'threads')
        if (formAdspowerId) fd.set('adspower_id', formAdspowerId)
        if (formProxyId) fd.set('proxy_id', formProxyId)
        if (formPersonaId) fd.set('persona_id', formPersonaId)

        const result = await createAccount(fd)
        if (result.error) {
            setFormError(result.error)
            return
        }
        if (result.data) {
            setAccounts(prev => [result.data!, ...prev])
        }
        setAddOpen(false)
        resetForm()
    }

    async function handleUpdate() {
        if (!editingAccount) return
        setFormError('')
        if (!formUsername) {
            setFormError('Username is required')
            return
        }
        const fd = new FormData()
        fd.set('username', formUsername)
        fd.set('platform', editingAccount.platform)
        if (formAdspowerId) fd.set('adspower_id', formAdspowerId)
        if (formProxyId) fd.set('proxy_id', formProxyId)
        if (formPersonaId) fd.set('persona_id', formPersonaId)

        const result = await updateAccount(editingAccount.id, fd)
        if (result.error) {
            setFormError(result.error)
            return
        }
        if (result.data) {
            setAccounts(prev => prev.map(a => a.id === editingAccount.id ? result.data! : a))
        }
        setEditOpen(false)
        setEditingAccount(null)
        resetForm()
    }

    async function handleDelete(id: string) {
        // Optimistic: remove immediately
        setAccounts(prev => prev.filter(a => a.id !== id))
        const result = await deleteAccount(id)
        if (result.error) {
            // Revert on error
            setAccounts(initialAccounts)
        }
    }

    async function handleToggle(id: string, currentActive: boolean) {
        // Optimistic: toggle immediately
        setAccounts(prev => prev.map(a => a.id === id ? { ...a, is_active: !currentActive } : a))
        const result = await toggleAccount(id, !currentActive)
        if (result.error) {
            setAccounts(prev => prev.map(a => a.id === id ? { ...a, is_active: currentActive } : a))
        } else if (result.data) {
            setAccounts(prev => prev.map(a => a.id === id ? result.data! : a))
        }
    }

    async function handleSync() {
        setSyncing(true)
        await syncAdsPowerProfiles()
        setSyncing(false)
        router.refresh()
    }

    const accountFormFields = (
        <div className="space-y-4 py-2">
            {formError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {formError}
                </p>
            )}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Username *</label>
                <Input
                    placeholder="@username"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-500"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">AdsPower ID</label>
                <Input
                    placeholder="AdsPower browser profile ID"
                    value={formAdspowerId}
                    onChange={(e) => setFormAdspowerId(e.target.value)}
                    className="bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-500"
                />
            </div>
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
        <div className="p-4 lg:p-10 space-y-6 lg:space-y-8 min-h-screen">
            <header className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-2xl">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
                        Account Management
                    </h1>
                    <p className="text-xs lg:text-sm text-zinc-400 mt-1">
                        Manage social accounts, proxies, and persona assignments.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        variant="outline"
                        className="border-white/10 text-zinc-400 hover:text-white rounded-xl h-10 px-4 gap-2"
                        disabled={syncing}
                        onClick={handleSync}
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
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

            <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
                <CardContent className="p-0 overflow-x-auto">
                    <Table className="min-w-[600px]">
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Username</TableHead>
                                <TableHead className="text-zinc-400">AdsPower ID</TableHead>
                                <TableHead className="text-zinc-400">Persona</TableHead>
                                <TableHead className="text-zinc-400">Proxy</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts.length === 0 ? (
                                <TableRow className="border-white/5">
                                    <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                                        No accounts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                accounts.map((acc) => (
                                    <TableRow key={acc.id} className="border-white/5 hover:bg-zinc-800/30">
                                        <TableCell className="text-white font-medium">
                                            @{acc.username}
                                        </TableCell>
                                        <TableCell className="text-zinc-400 font-mono text-xs">
                                            {acc.adspower_id || <span className="text-zinc-600">--</span>}
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
