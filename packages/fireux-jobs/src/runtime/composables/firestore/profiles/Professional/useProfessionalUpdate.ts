import type { Professional } from '../../../../models/profiles/Professional.model'
import { ref } from 'vue'
import { serverTimestamp } from 'firebase/firestore'
import { useCurrentUser } from 'vuefire'
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
  const currentUser = useCurrentUser()
  const updating = ref(false)
  const uploadingAvatar = ref(false)
  const updateError = ref<Error | null>(null)

  async function updateProfessional(
    updateData: Partial<Professional>,
    id?: string
  ): Promise<string> {
    const targetId = id || currentUser.value?.uid

    if (!targetId) {
      throw new Error('No profile ID provided and user is not authenticated')
    }

    updating.value = true
    updateError.value = null

    try {
      // Add updated timestamp and exclude immutable fields
      const profileData = {
        ...updateData,
        updated_at: serverTimestamp(),
      }

      // Remove immutable fields if they exist
      if ('uid' in profileData) delete profileData.uid
      if ('created_at' in profileData) delete profileData.created_at

      await updateDocument('professionals', targetId, profileData, {
        appScoped: false,
      })
      return 'success'
    } catch (err: any) {
      updateError.value =
        err instanceof Error
          ? err
          : new Error(err?.message || 'Failed to update professional profile')
      throw updateError.value
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
    updateError.value = null
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
          updated_at: serverTimestamp(),
        },
        {
          appScoped: false,
        }
      )

      return avatarUrl
    } catch (err: any) {
      updateError.value =
        err instanceof Error
          ? err
          : new Error(err?.message || 'Failed to upload avatar')
      throw updateError.value
    } finally {
      uploadingAvatar.value = false
    }
  }

  return {
    updateProfessional,
    updateProfessionalAvatar,
    updating,
    uploadingAvatar,
    updateError,
  }
}
