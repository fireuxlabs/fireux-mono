// Concurrent edit — 2026-07-20 15:20 CEST — Customer order notification pass: add the owner-only notification read mutation.
// Concurrent edit — 2026-07-21 15:25 CEST — Dashboard SSR repair: resolve the owner notification writer only when mark-read runs.
import { useRequireUser } from '../../../../composables/fireux/firebase/useRequireUser'

function requireNotificationId(value: unknown) {
  const id = String(value ?? '').trim()
  if (!id || id.includes('/')) {
    throw new Error('Notification id is invalid.')
  }
  return id
}

export function useUserNotificationRead() {
  const markRead = async (notificationId: string) => {
    const user = await useRequireUser()
    if (user.isAnonymous) {
      throw new Error('Sign in to update notifications.')
    }

    const id = requireNotificationId(notificationId)
    const token = await user.getIdToken()
    await $fetch(`/api/internal/user/notifications/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  return { markRead }
}
