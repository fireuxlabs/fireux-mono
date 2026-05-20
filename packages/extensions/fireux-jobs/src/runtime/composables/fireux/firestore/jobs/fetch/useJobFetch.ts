import { doc } from 'firebase/firestore'
import {
  useKitchenFetch,
  type KitchenFetchDoc,
} from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { computed, isRef, type Ref } from 'vue'
import { useDocument, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Job } from '../../../../../models/job.model'

type MiseboxJobResolved = Job & {
  kitchen?: KitchenFetchDoc | null
  workplace?: KitchenFetchDoc | null
}

export function useJobFetch(
  id: string | null | undefined | Ref<string | null | undefined>
) {
  const db = useFirestore()

  const jobId = computed(() => (isRef(id) ? id.value : id) ?? null)

  const docRef = computed(() =>
    jobId.value ? (doc(db, 'jobs', jobId.value) as any) : null
  )

  const { data, pending, error } = useDocument<Job | undefined>(docRef as any)
  const workplaceKitchenId = computed(() => {
    const current = data.value ?? null
    if (!current) return ''
    const workplaceId = String((current as any)?.workplace_id ?? '').trim()
    const workplaceType = String((current as any)?.workplace_type ?? '').trim()
    if (workplaceType !== 'kitchen' || !workplaceId) return ''
    return String(workplaceId)
  })
  const { kitchen: workplaceKitchen } = useKitchenFetch(workplaceKitchenId)

  const job = computed<MiseboxJobResolved | null>(() => {
    const current = data.value ?? null
    if (!current) return null
    const workplaceId = String((current as any)?.workplace_id ?? '').trim()
    const workplaceType = String((current as any)?.workplace_type ?? '').trim()
    return {
      ...current,
      workplace:
        workplaceType === 'kitchen' && workplaceId
          ? workplaceKitchen.value ?? null
          : null,
      kitchen:
        workplaceType === 'kitchen' && workplaceId
          ? workplaceKitchen.value ?? null
          : null,
    }
  })
  const isPending = computed(() => Boolean(pending.value))

  return { job, pending: isPending, error }
}

export type JobFetchRefs = ReturnType<typeof useJobFetch>
