import { getPersonas } from '@/app/actions/personas'
import type { Persona } from '@/lib/types'
import PersonasClient from './personas-client'

export default async function PersonasPage() {
    const result = await getPersonas()
    const personas: Persona[] = ('data' in result && result.data) ? result.data : []

    return <PersonasClient personas={personas} />
}
