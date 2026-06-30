import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import { JobStorage, type Job } from '../../../../../models/job.model'

type MiseboxJobResolved = Job

export function useJobCollection() {
  const fireUXConfig = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  const jobs = firestoreFetchCollection<Job>(JobStorage.collection)
  const pending = computed(() => jobs.value === undefined)

  const resolvedJobs = computed<MiseboxJobResolved[]>(() => {
    const allJobs = jobs.value ?? []
    return allJobs
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
