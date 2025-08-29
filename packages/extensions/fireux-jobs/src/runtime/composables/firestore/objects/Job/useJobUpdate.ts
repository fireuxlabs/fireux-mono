import { useFirestoreManager } from 'fireux-core/runtime/composables/firestore/useFirestoreManager'
import { serverTimestamp } from 'firebase/firestore'
import type { Job } from '../../../../models/objects/Job.model'

export function useJobUpdate() {
  const { updateDocument } = useFirestoreManager()

  async function updateJob(
    slug: string,
    updates: Partial<Job>
  ): Promise<boolean> {
    try {
      if (!slug) {
        throw new Error('Job slug is required for update.')
      }

      if (!updates || typeof updates !== 'object') {
        throw new Error('Invalid update payload. Must be an object.')
      }

      // Exclude immutable fields and add timestamp
      const { slug: _, appId, creator_id, created_at, ...safeUpdates } = updates
      const updateData = {
        ...safeUpdates,
        updated_at: serverTimestamp(),
      }

      await updateDocument('jobs', slug, updateData)
      console.log(`✅ Job updated successfully: ${slug}`)
      return true
    } catch (error) {
      console.error('❌ Error updating job:', error)
      throw error
    }
  }

  return { updateJob }
}
