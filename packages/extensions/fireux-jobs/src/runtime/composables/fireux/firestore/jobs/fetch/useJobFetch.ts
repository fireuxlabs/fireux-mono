import { doc } from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { useDocument, useFirestore } from 'vuefire'
import { useKitchenFetch } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch'
import type { Job, JobResolved } from '../../../../../models/objects/job.model'

export function useJobFetch(
  id: string | null | undefined | Ref<string | null | undefined>
) {
  const db = useFirestore()

  const jobId = computed(() => (isRef(id) ? id.value : id) ?? null)

  const docRef = computed(() =>
    jobId.value ? (doc(db, 'jobs', jobId.value) as any) : null
  )

  const { data, pending, error } = useDocument<Job | undefined>(docRef as any)
  const { kitchens } = useKitchenFetch()

  const kitchenById = computed(() => {
    const map = new Map<string, any>()
    for (const kitchen of kitchens.value ?? []) {
      if (kitchen?.id) map.set(String(kitchen.id), kitchen)
    }
    return map
  })

  const job = computed<JobResolved | null>(() => {
    const current = data.value ?? null
    if (!current) return null
    return {
      ...current,
      kitchen: current.kitchen_id ? kitchenById.value.get(String(current.kitchen_id)) : null,
    }
  })
  const isPending = computed(() => Boolean(pending.value))

  return { job, pending: isPending, error }
}

export type JobFetchRefs = ReturnType<typeof useJobFetch>
