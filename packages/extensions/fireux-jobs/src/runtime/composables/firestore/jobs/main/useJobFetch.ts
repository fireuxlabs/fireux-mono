import { doc } from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { useDocument, useFirestore } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { Job } from '../../../../types/job.model.ts'

/**
 * Fetch a single job for the active tenant: apps/{appId}/jobs/{id}
 */
export function useJobFetch(
  id: string | null | undefined | Ref<string | null | undefined>
) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()

  const jobId = computed(() => (isRef(id) ? id.value : id) ?? null)

  const jobDoc = computed(() => {
    if (!appId || !jobId.value) return null
    return doc(db, 'apps', appId, 'jobs', jobId.value) as any
  })

  const { data, pending } = useDocument<Job | undefined>(jobDoc as any)

  const job = computed<Job | null>(() => data.value ?? null)
  const isPending = computed(() => Boolean(pending.value))

  return { job, pending: isPending }
}

export type JobRefs = ReturnType<typeof useJobFetch>
