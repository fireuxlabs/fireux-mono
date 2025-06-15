import { ref, computed } from 'vue'
import { useMediaStorage } from '../firebase/useMediaStorage'

/**
 * Bridge composable that connects state-managed images to Firebase uploads
 * This helps integrate the molecules/forms/state/ components with Firebase storage
 */
export function useImageUploadBridge() {
  const { uploadImage } = useMediaStorage()
  const uploadProgress = ref<Record<string, number>>({})
  const uploadErrors = ref<Record<string, string>>({})
  const uploadedUrls = ref<Record<string, string>>({})

  /**
   * Upload multiple images from state-managed ImagePicker components
   * @param imageRefs - Object with key-value pairs of stateKey -> ImagePicker ref
   * @param collection - Firestore collection name
   * @param documentId - Document ID for organizing uploads
   * @returns Object with stateKey -> upload URL mappings
   */
  async function uploadStateImages(
    imageRefs: Record<string, any>,
    collection: string,
    documentId: string
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {}

    // Reset state
    Object.keys(imageRefs).forEach((key) => {
      uploadProgress.value[key] = 0
      uploadErrors.value[key] = ''
      uploadedUrls.value[key] = ''
    })

    // Upload each image
    for (const [stateKey, imageRef] of Object.entries(imageRefs)) {
      try {
        const file = imageRef?.getFile()
        const fileInfo = imageRef?.getFileInfo()

        if (!file || !fileInfo) {
          console.warn(`No file found for ${stateKey}`)
          continue
        }

        // Validate file
        const maxSize = 10 * 1024 * 1024 // 10MB
        const validTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
        ]

        if (fileInfo.size > maxSize || !validTypes.includes(fileInfo.type)) {
          uploadErrors.value[stateKey] = 'Invalid file size or type'
          continue
        }

        uploadProgress.value[stateKey] = 25

        // Upload to Firebase Storage
        const url = await uploadImage(file, collection, documentId, stateKey)

        if (url) {
          results[stateKey] = url
          uploadedUrls.value[stateKey] = url
          uploadProgress.value[stateKey] = 100

          // Clear the state after successful upload (optional)
          // imageRef?.clear()
        } else {
          uploadErrors.value[stateKey] = 'Upload failed'
        }
      } catch (error) {
        console.error(`Upload failed for ${stateKey}:`, error)
        uploadErrors.value[stateKey] =
          error instanceof Error ? error.message : 'Upload failed'
      }
    }

    return results
  }

  /**
   * Upload a single image from a state-managed ImagePicker
   * @param imageRef - ImagePicker component ref
   * @param collection - Firestore collection name
   * @param documentId - Document ID
   * @param type - Image type (e.g., 'featured', 'social', 'thumbnail')
   * @returns Upload URL or null
   */
  async function uploadSingleStateImage(
    imageRef: any,
    collection: string,
    documentId: string,
    type: string
  ): Promise<string | null> {
    try {
      const file = imageRef?.getFile()
      const fileInfo = imageRef?.getFileInfo()

      if (!file || !fileInfo) {
        console.warn(`No file found for ${type}`)
        return null
      }

      // Validate file
      const maxSize = 10 * 1024 * 1024 // 10MB
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

      if (fileInfo.size > maxSize || !validTypes.includes(fileInfo.type)) {
        throw new Error('Invalid file size or type')
      }

      uploadProgress.value[type] = 25

      // Upload to Firebase Storage
      const url = await uploadImage(file, collection, documentId, type)

      if (url) {
        uploadedUrls.value[type] = url
        uploadProgress.value[type] = 100
        return url
      } else {
        uploadErrors.value[type] = 'Upload failed'
        return null
      }
    } catch (error) {
      console.error(`Upload failed for ${type}:`, error)
      uploadErrors.value[type] =
        error instanceof Error ? error.message : 'Upload failed'
      return null
    }
  }

  /**
   * Get files from multiple ImagePicker refs for manual processing
   * @param imageRefs - Object with key-value pairs of stateKey -> ImagePicker ref
   * @returns Object with stateKey -> File mappings
   */
  function getFilesFromRefs(
    imageRefs: Record<string, any>
  ): Record<string, File> {
    const files: Record<string, File> = {}

    Object.entries(imageRefs).forEach(([key, ref]) => {
      const file = ref?.getFile()
      if (file) {
        files[key] = file
      }
    })

    return files
  }

  /**
   * Clear all upload state
   */
  function clearUploadState() {
    uploadProgress.value = {}
    uploadErrors.value = {}
    uploadedUrls.value = {}
  }

  return {
    // State
    uploadProgress: computed(() => uploadProgress.value),
    uploadErrors: computed(() => uploadErrors.value),
    uploadedUrls: computed(() => uploadedUrls.value),

    // Methods
    uploadStateImages,
    uploadSingleStateImage,
    getFilesFromRefs,
    clearUploadState,
  }
}
