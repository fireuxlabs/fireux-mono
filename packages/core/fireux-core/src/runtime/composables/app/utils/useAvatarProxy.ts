import { computed, toValue } from 'vue'
import type { Ref, ComputedRef } from 'vue'

/**
 * Utility function to proxy Google avatar URLs through our server
 * This bypasses CORS issues with Google profile images
 */
export function useAvatarProxy() {
  /**
   * Converts a Google profile image URL to use our proxy
   * @param avatarUrl - The original Google profile image URL
   * @returns Proxied URL or original URL if not a Google image
   */
  function getProxiedAvatarUrl(avatarUrl: string | null | undefined): string {
    // Return empty string for null/undefined
    if (!avatarUrl) return ''

    // If it's a Google profile image, proxy it
    if (
      avatarUrl.includes('googleusercontent.com') ||
      avatarUrl.includes('google.com/')
    ) {
      return `/api/proxy/google-avatar?url=${encodeURIComponent(avatarUrl)}`
    }

    // Return original URL for non-Google images
    return avatarUrl
  }

  /**
   * Reactive computed property for avatar URLs
   * @param avatarUrl - Reactive reference to avatar URL
   * @returns Reactive proxied avatar URL
   */
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
