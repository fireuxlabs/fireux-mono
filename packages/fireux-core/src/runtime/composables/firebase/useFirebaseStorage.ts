import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export function useAppFirebaseStorage() {
  const storage = getStorage()

  const uploadFile = async (
    path: string,
    file: Blob | Uint8Array | ArrayBuffer
  ): Promise<string | null> => {
    try {
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file)
      return await getDownloadURL(storageRef)
    } catch (error: any) {
      console.error('[Storage] Upload failed:', error?.message || error)
      return null
    }
  }

  return {
    uploadFile
  }
}
