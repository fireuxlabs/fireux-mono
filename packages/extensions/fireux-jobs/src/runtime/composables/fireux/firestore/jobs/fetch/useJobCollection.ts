import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Job } from '../../../../../models/objects/job.model'

export function useJobCollection() {
  const fireUXConfig = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  const jobs = firestoreFetchCollection<Job>('jobs')
  const pending = computed(() => jobs.value === undefined)
  const appJobs = computed(() => {
    const allJobs = jobs.value ?? []
    if (!fireUXConfig.isTenant || !fireUXConfig.appId) {
      return allJobs
    }
    return allJobs.filter((job) => job.app_id === fireUXConfig.appId)
  })

  return {
    jobs,
    appJobs,
    pending,
  }
}
