import { getAccounts } from '@/app/actions/accounts'
import { getPersonas } from '@/app/actions/personas'
import { getProxies } from '@/app/actions/proxies'
import { syncAdsPowerProfiles } from '@/app/actions/adspower-sync'
import type { Account, Persona, Proxy } from '@/lib/types'
import AccountsClient from './accounts-client'

export default async function AccountsPage() {
    // 페이지 로드 시 AdsPower → Supabase 자동 동기화
    await syncAdsPowerProfiles()

    const [accountsResult, personasResult, proxiesResult] = await Promise.all([
        getAccounts(),
        getPersonas(),
        getProxies(),
    ])

    const accounts: Account[] = ('data' in accountsResult && accountsResult.data) ? accountsResult.data : []
    const personas: Persona[] = ('data' in personasResult && personasResult.data) ? personasResult.data : []
    const proxies: Proxy[] = ('data' in proxiesResult && proxiesResult.data) ? proxiesResult.data : []

    return <AccountsClient accounts={accounts} personas={personas} proxies={proxies} />
}
