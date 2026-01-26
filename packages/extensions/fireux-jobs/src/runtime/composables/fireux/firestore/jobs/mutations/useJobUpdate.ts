import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import type { Job } from '../../../../../models/objects/job.model'

export function useJobUpdate() {
  const { updateDocument } = useFirestoreManager()

  type JobUpdateInput = Partial<
    Pick<
      Job,
      'title' | 'status' | 'company_id' | 'kitchen_id' | 'source'
    >
  >

  const updateJob = async (jobId: string, patch: JobUpdateInput) => {
    const id = String(jobId ?? '').trim()
    if (!id) {
      throw new Error('[useJobUpdate] jobId is required')
    }
    await updateDocument<Job>('jobs', id, patch)
  }

  return { updateJob }
}
