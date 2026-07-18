import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import { JobStorage, type Job } from '../../../../../models/job.model'

type MiseboxJobResolved = Job

export function useJobCollection() {
  const fireUXConfig = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  const source = firestoreFetchCollection<Job>(JobStorage.collection)

  const resolvedJobs = computed<MiseboxJobResolved[]>(() => {
    const allJobs = source.value ?? []
    return allJobs
  })

  const appJobs = computed<MiseboxJobResolved[]>(() => {
    const allJobs = resolvedJobs.value ?? []
    if (!fireUXConfig.isTenant || !fireUXConfig.appId) {
      return allJobs
    }
    return allJobs.filter((job) => job.source_app_id === fireUXConfig.appId)
  })
  const count = computed(() => appJobs.value.length)
  const pending = computed(() => source.pending.value)
  const error = computed(() => source.error.value)
  const { outcome } = useFirestoreCollectionState({
    count,
    error,
    pending,
  })

  return {
    jobs: resolvedJobs,
    appJobs,
    count,
    pending,
    error,
    outcome,
  }
}
