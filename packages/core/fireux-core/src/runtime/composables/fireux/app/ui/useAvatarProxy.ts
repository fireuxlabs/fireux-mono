import { computed, toValue } from 'vue'
import type { Ref, ComputedRef } from 'vue'

/**
 * Utility to proxy Google avatar URLs through our server (avoids CORS issues).
 */
export function useAvatarProxy() {
  function getProxiedAvatarUrl(avatarUrl: string | null | undefined): string {
    if (!avatarUrl) return ''
    if (
      avatarUrl.includes('firebasestorage.googleapis.com') ||
      avatarUrl.includes('storage.googleapis.com')
    ) {
      return avatarUrl
    }
    if (
      avatarUrl.includes('googleusercontent.com') ||
      avatarUrl.includes('google.com/') ||
      avatarUrl.includes('googleapis.com') ||
      avatarUrl.includes('gstatic.com')
    ) {
      return `/api/proxy/image?url=${encodeURIComponent(avatarUrl)}`
    }
    return avatarUrl
  }

  function useProxiedAvatar(
    avatarUrl:
      | Ref<string | null | undefined>
      | ComputedRef<string | null | undefined>
  ) {
    return computed(() => getProxiedAvatarUrl(toValue(avatarUrl)))
  }

  return {
    getProxiedAvatarUrl,
    useProxiedAvatar,
  }
}
