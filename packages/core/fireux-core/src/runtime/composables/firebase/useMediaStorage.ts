// packages/core/fireux-core/src/runtime/composables/firebase/useMediaStorage.ts
// Back-compat shim: reuse the new generic image storage API.
import { useImageStorage } from './useImageStorage'

export function useMediaStorage() {
  const { uploadImage, getDefaultImageUrl } = useImageStorage()

  // Legacy name kept for compatibility; now points to the unified default image
  const getDefaultAvatarUrl = () => getDefaultImageUrl('/img/default-image.png')

  const uploadCoreAvatar = async (source: File | string, uid: string) =>
    uploadImage(`core-users/${uid}/avatar.jpg`, source)

  return {
    uploadCoreAvatar,
    uploadImage,
    getDefaultAvatarUrl,
  }
}
