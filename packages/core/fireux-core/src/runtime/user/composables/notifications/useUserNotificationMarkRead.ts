import { refreshNuxtData } from 'nuxt/app'
import { useRequireUser } from '../../../composables/fireux/firebase/useRequireUser'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'

function requireNotificationId(value: unknown) {
  const id = String(value ?? '').trim()
  if (!id || id.includes('/')) throw new Error('Notification id is invalid.')
  return id
}

export function useUserNotificationMarkRead() {
  const { currentUser } = useAuth(),
    config = useFireUXConfig()
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid,
    () => config.appId,
  ])
  const markRead = async (notificationId: string) => {
    const id = requireNotificationId(notificationId),
      uid = currentUser.value?.uid
    const isCurrent = captureIntent()
    const assertCurrent = () => {
      if (!uid || !isCurrent())
        throw new Error('The account or App context changed. Please try again.')
    }
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid || user.isAnonymous)
      throw new Error('Sign in to update your notifications.')
    const token = await user.getIdToken()
    assertCurrent()
    const result = await $fetch<{
      ok: true
      uid: string
      notificationId: string
      read: true
    }>(`/api/internal/user/notifications/${encodeURIComponent(id)}`, {
      onResponse: async ({ options, response }) => {
        if (
          response.ok &&
          !['GET', 'HEAD'].includes(
            String(options.method || 'GET').toUpperCase()
          )
        )
          await refreshNuxtData()
      },
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (
      result?.ok !== true ||
      result.uid !== uid ||
      result.notificationId !== id ||
      result.read !== true
    )
      throw new Error(
        'Notification response did not match the requested notification.'
      )
  }
  return { markRead, captureIntent }
}
