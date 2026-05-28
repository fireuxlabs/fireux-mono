import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { JobStorage } from '../../../../../models/job.model'

export function useJobDelete() {
  const { deleteDocument } = useFirestoreManager()

  const deleteJob = async (jobId: string) => {
    const id = String(jobId ?? '').trim()
    if (!id) {
      throw new Error('[useJobDelete] jobId is required')
    }
    await deleteDocument(JobStorage.collection, id)
  }

  return { deleteJob }
}
