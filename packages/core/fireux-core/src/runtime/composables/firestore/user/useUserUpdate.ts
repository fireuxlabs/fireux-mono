// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserUpdate.ts
import { useScopedUpdater } from '../scopedUpdater'

/**
 * Minimal updater for the signed-in user's core/app docs.
 * - Updates core: core-users/{uid}
 * - If tenant context is active, mirrors to app: apps/{appId}/users/{uid}
 * - Auto-stamps updated_at and app metadata
 */
export function useUserUpdate() {
  const { update } = useScopedUpdater('users')
  const isDev = typeof process !== 'undefined' && (process as any).dev === true
  const dlog = (...args: any[]) => {
    if (isDev) console.log('[avatar-trace][useUserUpdate]', ...args)
  }

  const updateDisplayName = async (display_name: string) => {
    dlog('updateDisplayName', { display_name })
    await update({ display_name })
  }

  // Expect a download URL; add ?v to bust caches
  const updateAvatar = async (avatarUrl: string) => {
    const sep = avatarUrl.includes('?') ? '&' : '?'
    const versioned = `${avatarUrl}${sep}v=${Date.now()}`
    dlog('updateAvatar', { avatarUrl, versioned })
    await update({ avatar: versioned })
  }

  return { updateDisplayName, updateAvatar }
}
