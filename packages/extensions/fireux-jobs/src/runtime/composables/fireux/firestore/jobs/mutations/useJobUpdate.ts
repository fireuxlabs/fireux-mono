import { useDocumentUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/operations/useDocumentUpdateBase'
import type { Job, JobUpdateInput } from '../../../../../models/objects/job.model'

export function useJobUpdate() {
  const base = useDocumentUpdateBase<Job>('jobs', { resolvePath: false })

  const updateJob = async (jobId: string, patch: JobUpdateInput) => {
    await base.updateById(jobId, patch)
  }

  return { updateJob }
}
