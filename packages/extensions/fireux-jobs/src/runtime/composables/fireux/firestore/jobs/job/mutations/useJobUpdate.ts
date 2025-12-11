import type { Job } from '../../../../../models/job.model.ts'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'

export function useJobUpdate() {
  const { updateDocument } = useFirestoreManager()

  type JobUpdateInput = Partial<Pick<Job, 'title' | 'status'>>

  const updateJob = async (jobId: string, patch: JobUpdateInput) => {
    const id = String(jobId ?? '').trim()
    if (!id) {
      throw new Error('[useJobUpdate] jobId is required')
    }
    await updateDocument<Job>('jobs', id, patch)
  }

  return { updateJob }
}
