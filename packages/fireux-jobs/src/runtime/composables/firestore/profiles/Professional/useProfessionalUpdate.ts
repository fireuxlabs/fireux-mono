import type { Professional } from '../../../../models/Professional.model'
import { ref } from 'vue'
import { useFirestoreManager } from '../../../../../../../fireux-core/src/runtime/composables/firestore/useFirestoreManager'
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'

export function useProfessionalUpdate() {
  const { updateDocument } = useFirestoreManager()
  const storage = getStorage()
  const updating = ref(false)
  const uploadingAvatar = ref(false)
  const error = ref<Error | null>(null)

  async function updateProfessional(
    id: string,
    professional: Partial<Professional>
  ) {
    updating.value = true
    error.value = null
    try {
      await updateDocument('professionals', id, professional, {
        appScoped: false,
      })
      return 'success'
    } catch (err: any) {
      error.value = err
      throw err
    } finally {
      updating.value = false
    }
  }

  /**
   * Upload avatar for professional
   * Stores in professionals/{id}/avatar
   */
  async function updateProfessionalAvatar(id: string, file: File) {
    uploadingAvatar.value = true
    error.value = null
    try {
      // Create storage reference for professionals/{id}/avatar
      const avatarPath = `professionals/${id}/avatar`
      const avatarRef = storageRef(storage, avatarPath)

      // Upload the file
      await uploadBytes(avatarRef, file)

      // Get the download URL
      const avatarUrl = await getDownloadURL(avatarRef)

      // Update the professional document with the new avatar URL
      await updateDocument(
        'professionals',
        id,
        {
          avatarUrl,
          updated_at: new Date().toISOString(),
        },
        {
          appScoped: false,
        }
      )

      return avatarUrl
    } catch (err: any) {
      error.value = err
      throw err
    } finally {
      uploadingAvatar.value = false
    }
  }

  return {
    updateProfessional,
    updateProfessionalAvatar,
    updating,
    uploadingAvatar,
    error,
  }
}
