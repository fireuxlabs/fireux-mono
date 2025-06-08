import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'
import { useAppFirebaseStorage } from './useFirebaseStorage'
import { useFireUXConfig } from '../FireUXConfig'

// For dynamic imports in Nuxt 3

export function useMediaStorage() {
  const { uploadFile } = useAppFirebaseStorage()
  const storage = getStorage()
  const { appName, appId } = useFireUXConfig()

  // Convert Data-URL to Blob
  const dataUrlToBlob = (dataUrl: string): Promise<Blob> =>
    fetch(dataUrl).then((res) => res.blob())

  // Resize a Blob to a max width
  const resizeBlob = (blob: Blob, maxWidth = 512): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const scale = maxWidth / img.width
        const canvas = document.createElement('canvas')
        canvas.width = maxWidth
        canvas.height = img.height * scale
        canvas
          .getContext('2d')
          ?.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (resized) =>
            resized ? resolve(resized) : reject(new Error('Resize failed')),
          'image/jpeg',
          0.8
        )
      }
      img.onerror = reject
      img.src = URL.createObjectURL(blob)
    })

  // Upload a Blob and return its download URL
  const uploadBlobToStorage = async (blob: Blob, fullPath: string) => {
    await uploadFile(fullPath, blob)
    return getDownloadURL(storageRef(storage, fullPath))
  }

  // General Image Upload Function
  const uploadImage = async (
    source: File | string,
    collection: string,
    id: string,
    type: string
  ): Promise<string> => {
    const blob =
      typeof source === 'string' ? await dataUrlToBlob(source) : source

    const resized = await resizeBlob(blob)
    const path = `${appName}/${collection}/${id}/${type}Image.jpg`
    return uploadBlobToStorage(resized, path)
  }

  // ✅ NEW: Direct Avatar Upload Using Core User ID
  const uploadUserAvatar = async (
    source: File | string,
    uid: string
  ): Promise<string> => {
    const blob =
      typeof source === 'string' ? await dataUrlToBlob(source) : source

    const resized = await resizeBlob(blob)
    const path = `users/${uid}/avatar.jpg`
    return uploadBlobToStorage(resized, path)
  }

  return { uploadImage, uploadUserAvatar }
}
