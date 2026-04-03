import { getAccounts } from '@/app/actions/accounts'
import { syncAdsPowerProfiles } from '@/app/actions/adspower-sync'
import type { Account } from '@/lib/types'
import EngageClient from './engage-client'

export default async function EngagePage() {
    await syncAdsPowerProfiles()

    const result = await getAccounts()
    const allAccounts: Account[] = ('data' in result && result.data) ? result.data : []

    // AdsPower 프로필이 연결된 활성 계정만
    const accounts = allAccounts.filter(a => a.adspower_id && a.is_active)

    return <EngageClient accounts={accounts} />
}
