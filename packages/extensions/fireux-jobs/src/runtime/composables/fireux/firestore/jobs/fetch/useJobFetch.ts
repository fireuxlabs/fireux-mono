import { doc } from 'firebase/firestore'
import { useKitchenFetch } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch'
import type { Kitchen } from 'fireux-kitchens/runtime/models/objects/kitchen.model'
import { computed, isRef, type Ref } from 'vue'
import { useDocument, useFirestore } from 'vuefire'
import type { Job } from '../../../../../models/objects/job.model'
import { resolveWorkplace, resolveWorkplaceMeta } from '../../../../../workplace/resolveWorkplace'

type MiseboxJobResolved = Job & {
  kitchen?: Kitchen | null
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
  const { kitchens } = useKitchenFetch()

  const kitchenById = computed(() => {
    const map = new Map<string, any>()
    for (const kitchen of kitchens.value ?? []) {
      if (kitchen?.id) map.set(String(kitchen.id), kitchen)
    }
    return map
  })

  const job = computed<MiseboxJobResolved | null>(() => {
    const current = data.value ?? null
    if (!current) return null
    const { workplaceType } = resolveWorkplaceMeta(current)
    const workplace = resolveWorkplace(current, { kitchens: kitchenById.value })
    return {
      ...current,
      kitchen: workplaceType === 'kitchen' ? ((workplace as Kitchen) ?? null) : null,
    }
  })
  const isPending = computed(() => Boolean(pending.value))

  return { job, pending: isPending, error }
}

export type JobFetchRefs = ReturnType<typeof useJobFetch>
