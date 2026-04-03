import { getJobs } from '@/app/actions/jobs'
import { getAccounts } from '@/app/actions/accounts'
import type { Job, Account } from '@/lib/types'
import CalendarClient from './calendar-client'

export default async function CalendarPage() {
    const [jobsResult, accountsResult] = await Promise.all([
        getJobs(),
        getAccounts(),
    ])

    const jobs: Job[] = ('data' in jobsResult && jobsResult.data) ? jobsResult.data : []
    const accounts: Account[] = ('data' in accountsResult && accountsResult.data) ? accountsResult.data : []

    return <CalendarClient jobs={jobs} accounts={accounts} />
}
