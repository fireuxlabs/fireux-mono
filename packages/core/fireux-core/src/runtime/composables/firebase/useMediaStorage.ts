import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'
import { useAppFirebaseStorage } from './useFirebaseStorage'
import { useFireUXConfig } from '../FireUXConfig'

/**
 * Simplified image upload system
 * Supports: Product images, Blog images (featured/social), User avatars
 */
export function useMediaStorage() {
  const { uploadFile } = useAppFirebaseStorage()
  const storage = getStorage()
  const { appId } = useFireUXConfig()

  // Convert Data-URL to Blob
  const dataUrlToBlob = (dataUrl: string): Promise<Blob> =>
    fetch(dataUrl).then((res) => res.blob())

  // Resize image with smart defaults for different use cases
  const resizeImage = (blob: Blob, maxWidth = 800): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (resized) =>
            resized ? resolve(resized) : reject(new Error('Resize failed')),
          'image/jpeg',
          0.85
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(blob)
    })

  // Core upload function
  const uploadToStorage = async (blob: Blob, path: string): Promise<string> => {
    await uploadFile(path, blob)
    return getDownloadURL(storageRef(storage, path))
  }

  // Process and upload any image
  const uploadImage = async (
    source: File | string,
    collection: string,
    id: string,
    type: string,
    maxWidth?: number
  ): Promise<string> => {
    console.log('📤 uploadImage called with:')
    console.log('  - collection:', collection)
    console.log('  - id:', id)
    console.log('  - type:', type)
    console.log('  - appId:', appId)

    // Convert source to blob
    const blob =
      typeof source === 'string' ? await dataUrlToBlob(source) : source

    // Set smart defaults based on image type
    let imageMaxWidth = maxWidth
    if (!imageMaxWidth) {
      switch (type) {
        case 'avatar':
          imageMaxWidth = 400
          break
        case 'featured':
        case 'social':
          imageMaxWidth = 1200
          break
        default:
          imageMaxWidth = 800
      }
    }

    // Resize image
    const resized = await resizeImage(blob, imageMaxWidth)

    // Generate path with apps prefix to match database structure
    const path = `apps/${appId}/${collection}/${id}/${type}.jpg`

    // Upload and return URL
    return await uploadToStorage(resized, path)
  }

  // Specialized avatar upload
  const uploadUserAvatar = async (
    source: File | string,
    uid: string
  ): Promise<string> => {
    // Use just 'users' - the uploadImage function will add apps/{appId} prefix
    return await uploadImage(source, 'users', uid, 'avatar', 400)
  }

  return {
    uploadImage,
    uploadUserAvatar,
  }
}
