// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: keep Job fetches domain-neutral and unhydrated.
// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: reserve raw exact reads for authenticated authoring surfaces.
import { doc } from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { useDocument, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { JobStorage, type Job } from '../../../../../models/job.model'

export function useJobFetch(
  id: string | null | undefined | Ref<string | null | undefined>
) {
  const db = useFirestore()

  const jobId = computed(() => (isRef(id) ? id.value : id) ?? null)

  const docRef = computed(() =>
    jobId.value ? (doc(db, JobStorage.collection, jobId.value) as any) : null
  )

  const { data, pending, error } = useDocument<Job | undefined>(docRef as any)
  const job = computed<Job | null>(() => data.value ?? null)
  const isPending = computed(() => Boolean(pending.value))

  return { job, pending: isPending, error }
}

export type JobFetchRefs = ReturnType<typeof useJobFetch>
