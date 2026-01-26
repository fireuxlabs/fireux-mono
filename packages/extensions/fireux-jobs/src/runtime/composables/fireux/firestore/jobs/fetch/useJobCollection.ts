import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useKitchenFetch } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch'
import { computed } from 'vue'
import type { Job, JobResolved } from '../../../../../models/objects/job.model'

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

  const resolvedJobs = computed<JobResolved[]>(() => {
    const allJobs = jobs.value ?? []
    return allJobs.map((job) => ({
      ...job,
      kitchen: job.kitchen_id ? kitchenById.value.get(String(job.kitchen_id)) : null,
    }))
  })

  const appJobs = computed<JobResolved[]>(() => {
    const allJobs = resolvedJobs.value ?? []
    if (!fireUXConfig.isTenant || !fireUXConfig.appId) {
      return allJobs
    }
    return allJobs.filter((job) => job.app_id === fireUXConfig.appId)
  })

  return {
    jobs: resolvedJobs,
    appJobs,
    pending,
  }
}
