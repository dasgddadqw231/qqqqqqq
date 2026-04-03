'use client'

import { useState } from 'react'
import { Shield, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createProxy, updateProxy, deleteProxy, updateProxyStatus } from '@/app/actions/proxies'
import type { Proxy, ProxyStatus } from '@/lib/types'

const STATUS_STYLES: Record<ProxyStatus, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  failing: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  dead: 'bg-red-500/15 text-red-400 border-red-500/30',
}

export default function ProxiesClient({ proxies: initialProxies }: { proxies: Proxy[] }) {
  const [proxies, setProxies] = useState(initialProxies)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProxy, setEditingProxy] = useState<Proxy | null>(null)
  const [bulkStatus, setBulkStatus] = useState<ProxyStatus | ''>('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  function openCreate() {
    setEditingProxy(null)
    setDialogOpen(true)
  }

  function openEdit(proxy: Proxy) {
    setEditingProxy(proxy)
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    if (editingProxy) {
      const result = await updateProxy(editingProxy.id, formData)
      if (result.data) {
        setProxies(prev => prev.map(p => p.id === editingProxy.id ? result.data! : p))
      }
    } else {
      const result = await createProxy(formData)
      if (result.data) {
        setProxies(prev => [result.data!, ...prev])
      }
    }

    setLoading(false)
    setDialogOpen(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this proxy?')) return
    setProxies(prev => prev.filter(p => p.id !== id))
    const result = await deleteProxy(id)
    if (result.error) {
      setProxies(initialProxies)
    }
  }

  async function handleBulkStatusUpdate() {
    if (!bulkStatus || selectedIds.size === 0) return
    setLoading(true)
    // Optimistic
    setProxies(prev => prev.map(p =>
      selectedIds.has(p.id) ? { ...p, status: bulkStatus } : p
    ))
    for (const id of selectedIds) {
      await updateProxyStatus(id, bulkStatus)
    }
    setSelectedIds(new Set())
    setBulkStatus('')
    setLoading(false)
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === proxies.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(proxies.map(p => p.id)))
    }
  }

  async function handleStatusChange(id: string, status: ProxyStatus) {
    setProxies(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    await updateProxyStatus(id, status)
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString()
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Proxies</h1>
            <p className="text-zinc-500 text-xs lg:text-sm mt-0.5">{proxies.length} proxy servers configured</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 self-start sm:self-auto">
          <Plus className="w-4 h-4" data-icon="inline-start" />
          Add Proxy
        </Button>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-white/5">
          <span className="text-sm text-zinc-400">{selectedIds.size} selected</span>
          <Select value={bulkStatus} onValueChange={(val: string | null) => setBulkStatus((val ?? '') as ProxyStatus | '')}>
            <SelectTrigger className="w-[140px] bg-zinc-800/50 border-white/10">
              <SelectValue placeholder="Set status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="failing">Failing</SelectItem>
              <SelectItem value="dead">Dead</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleBulkStatusUpdate}
            disabled={!bulkStatus || loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-3 h-3" data-icon="inline-start" />
            Update Status
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.size === proxies.length && proxies.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded accent-purple-500"
                />
              </TableHead>
              <TableHead className="text-zinc-400">IP</TableHead>
              <TableHead className="text-zinc-400">Port</TableHead>
              <TableHead className="text-zinc-400">Username</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Last Checked</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proxies.length === 0 ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                  No proxies configured. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              proxies.map((proxy) => (
                <TableRow key={proxy.id} className="border-white/5 hover:bg-zinc-800/30">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(proxy.id)}
                      onChange={() => toggleSelect(proxy.id)}
                      className="rounded accent-purple-500"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-zinc-300">{proxy.ip}</TableCell>
                  <TableCell className="font-mono text-zinc-300">{proxy.port}</TableCell>
                  <TableCell className="text-zinc-400">{proxy.username || '-'}</TableCell>
                  <TableCell>
                    <Badge className={`${STATUS_STYLES[proxy.status]} border cursor-pointer`} onClick={() => {
                      const statuses: ProxyStatus[] = ['active', 'failing', 'dead']
                      const nextIdx = (statuses.indexOf(proxy.status) + 1) % statuses.length
                      handleStatusChange(proxy.id, statuses[nextIdx])
                    }}>
                      {proxy.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-xs">{formatDate(proxy.last_checked_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(proxy)}>
                        <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(proxy.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingProxy ? 'Edit Proxy' : 'Add Proxy'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">IP Address</label>
                <Input name="ip" placeholder="192.168.1.1" defaultValue={editingProxy?.ip ?? ''} required className="bg-zinc-800/50 border-white/10 text-white" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Port</label>
                <Input name="port" type="number" placeholder="8080" defaultValue={editingProxy?.port ?? ''} required className="bg-zinc-800/50 border-white/10 text-white" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Username</label>
                <Input name="username" placeholder="Optional" defaultValue={editingProxy?.username ?? ''} className="bg-zinc-800/50 border-white/10 text-white" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Password</label>
                <Input name="password" type="password" placeholder="Optional" defaultValue={editingProxy?.password ?? ''} className="bg-zinc-800/50 border-white/10 text-white" />
              </div>
            </div>
            <DialogFooter className="bg-transparent border-0">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="text-zinc-400">Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0">
                {loading ? 'Saving...' : editingProxy ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
