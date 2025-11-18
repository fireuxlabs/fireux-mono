import { computed } from 'vue'
import { collection } from 'firebase/firestore'
import { useCollection, useFirestore } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { Job, JobStatus } from '../../../../types/job.model.ts'

export function useJobCollection() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()

  const jobRef = useCollection<Job>(collection(db, 'jobs') as any, {
    idField: 'id',
  })

  const jobs = computed<Job[]>(() => jobRef.value ?? [])

  const jobsByTenant = (tenantId?: string | null) =>
    computed(() => {
      if (!tenantId) return jobs.value
      return jobs.value.filter((job) => job?.tenant_id === tenantId)
    })

  const jobsByStatus = (status: JobStatus) =>
    computed(() => jobs.value.filter((job) => job?.status === status))

  const tenantJobs = jobsByTenant(appId ?? null)

  const pending = computed(() => jobRef.value == null)

  return {
    jobs,
    tenantJobs,
    jobsByTenant,
    jobsByStatus,
    pending,
  }
}
