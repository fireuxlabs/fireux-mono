import { collection, orderBy, query } from 'firebase/firestore'
import { computed } from 'vue'
import { useCollection, useFirestore } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { Job } from '../../../../types/job.model.ts'

/**
 * Fetch jobs for the current tenant, newest first.
 */
export function useJobCollection() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()

  const jobsQuery = computed(() => {
    if (!appId) return null
    return query(
      collection(db, 'apps', appId, 'jobs'),
      orderBy('created_at', 'desc')
    ) as any
  })

  const { data, pending } = useCollection<Job>(jobsQuery as any)

  const jobs = computed<Job[] | null>(() => data.value ?? null)
  const isPending = computed(() => Boolean(pending.value))

  return { jobs, pending: isPending }
}
