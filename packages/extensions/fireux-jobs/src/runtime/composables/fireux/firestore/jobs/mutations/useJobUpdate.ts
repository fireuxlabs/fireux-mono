import { useDocumentUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/operations/useDocumentUpdateBase'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/firestore/seo/useSeoIndexWrite'
import type { Job, JobUpdateInput } from '../../../../../models/job.model'

export function useJobUpdate() {
  const base = useDocumentUpdateBase<Job>('jobs', { resolvePath: false })
  const { upsertSeoIndexDoc } = useSeoIndexWrite()

  const updateJob = async (jobId: string, patch: JobUpdateInput) => {
    await base.updateById(jobId, patch)
    await upsertSeoIndexDoc('seo_index_jobs', jobId, {
      path: `/jobs/${jobId}`,
      isPublic:
        typeof patch?.status === 'string' ? patch.status === 'open' : undefined,
    })
  }

  return { updateJob }
}
