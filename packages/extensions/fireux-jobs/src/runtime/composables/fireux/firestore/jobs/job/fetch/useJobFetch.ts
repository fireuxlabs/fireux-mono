import { doc } from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { useDocument, useFirestore } from 'vuefire'
import type { Job } from '../../../../../models/job.model.ts'

export function useJobFetch(
  id: string | null | undefined | Ref<string | null | undefined>
) {
  const db = useFirestore()

  const jobId = computed(() => (isRef(id) ? id.value : id) ?? null)

  const docRef = computed(() =>
    jobId.value ? (doc(db, 'jobs', jobId.value) as any) : null
  )

  const { data, pending, error } = useDocument<Job | undefined>(docRef as any)

  const job = computed<Job | null>(() => data.value ?? null)
  const isPending = computed(() => Boolean(pending.value))

  return { job, pending: isPending, error }
}

export type JobFetchRefs = ReturnType<typeof useJobFetch>
