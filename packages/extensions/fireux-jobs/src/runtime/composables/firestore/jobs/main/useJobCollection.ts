import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreRead } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreRead.ts'
import type { Job } from '../../../../models/job.model.ts'

export function useJobCollection() {
  const fireUXConfig = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  const jobs = firestoreFetchCollection<Job>('jobs')
  const pending = computed(() => jobs.value === undefined)
  const tenantJobs = computed(() => {
    const allJobs = jobs.value ?? []
    if (!fireUXConfig.isTenant || !fireUXConfig.appId) {
      return allJobs
    }
    return allJobs.filter((job) => job.tenant_id === fireUXConfig.appId)
  })

  return {
    jobs,
    tenantJobs,
    pending,
  }
}
