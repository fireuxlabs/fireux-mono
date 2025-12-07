import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'

export function useJobDelete() {
  const { deleteDocument } = useFirestoreManager()

  const deleteJob = async (jobId: string) => {
    const id = String(jobId ?? '').trim()
    if (!id) {
      throw new Error('[useJobDelete] jobId is required')
    }
    await deleteDocument('jobs', id)
  }

  return { deleteJob }
}
