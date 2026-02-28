import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'

export function useJobDelete() {
  const { deleteDocument } = useFirestoreManager()
  const { deleteSeoIndexDoc } = useSeoIndexWrite()

  const deleteJob = async (jobId: string) => {
    const id = String(jobId ?? '').trim()
    if (!id) {
      throw new Error('[useJobDelete] jobId is required')
    }
    await deleteDocument('jobs', id)
    await deleteSeoIndexDoc('seo_index_jobs', id)
  }

  return { deleteJob }
}
