import type { Job } from '../../../../models/job.model.ts'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'

export function useJobUpdate() {
  const { updateDocument } = useFirestoreManager()

  const updateJob = async (
    jobId: string,
    patch: Partial<Omit<Job, 'id' | 'created_by' | 'tenant_id'>> &
      Partial<Pick<Job, 'tenant_id' | 'created_by'>>
  ) => {
    const id = String(jobId ?? '').trim()
    if (!id) {
      throw new Error('[useJobUpdate] jobId is required')
    }
    await updateDocument<Job>('jobs', id, patch)
  }

  return { updateJob }
}
