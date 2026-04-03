import { getProxies } from '@/app/actions/proxies'
import type { Proxy } from '@/lib/types'
import ProxiesClient from './proxies-client'

export default async function ProxiesPage() {
    const result = await getProxies()
    const proxies: Proxy[] = ('data' in result && result.data) ? result.data : []

    return <ProxiesClient proxies={proxies} />
}
