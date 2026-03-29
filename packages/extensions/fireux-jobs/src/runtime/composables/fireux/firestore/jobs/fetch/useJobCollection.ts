import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useKitchenFetch } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import type { Kitchen } from 'fireux-kitchens/runtime/models/kitchen.model'
import { computed } from 'vue'
import type { Job } from '../../../../../models/job.model'

type MiseboxJobResolved = Job & {
  kitchen?: Kitchen | null
}

export function useJobCollection() {
  const fireUXConfig = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  const jobs = firestoreFetchCollection<Job>('jobs')
  const pending = computed(() => jobs.value === undefined)
  const { kitchens } = useKitchenFetch()

  const kitchenById = computed(() => {
    const map = new Map<string, any>()
    for (const kitchen of kitchens.value ?? []) {
      if (kitchen?.id) map.set(String(kitchen.id), kitchen)
    }
    return map
  })

  const resolvedJobs = computed<MiseboxJobResolved[]>(() => {
    const allJobs = jobs.value ?? []
    return allJobs.map((job) => ({
      ...job,
      kitchen: (() => {
        const legacyKitchenId = String((job as any)?.kitchen_id ?? '')
        const workplaceId = String((job as any)?.workplace_id ?? '') || legacyKitchenId
        const workplaceType = String((job as any)?.workplace_type ?? '') ||
          (legacyKitchenId ? 'kitchen' : '')
        if (workplaceType !== 'kitchen' || !workplaceId) return null
        return kitchenById.value.get(String(workplaceId)) ?? null
      })(),
      workplace: (() => {
        const legacyKitchenId = String((job as any)?.kitchen_id ?? '')
        const workplaceId = String((job as any)?.workplace_id ?? '') || legacyKitchenId
        const workplaceType = String((job as any)?.workplace_type ?? '') ||
          (legacyKitchenId ? 'kitchen' : '')
        if (workplaceType !== 'kitchen' || !workplaceId) return null
        return kitchenById.value.get(String(workplaceId)) ?? null
      })(),
    }))
  })

  const appJobs = computed<MiseboxJobResolved[]>(() => {
    const allJobs = resolvedJobs.value ?? []
    if (!fireUXConfig.isTenant || !fireUXConfig.appId) {
      return allJobs
    }
    return allJobs.filter((job) => job.source_app_id === fireUXConfig.appId)
  })

  return {
    jobs: resolvedJobs,
    appJobs,
    pending,
  }
}
