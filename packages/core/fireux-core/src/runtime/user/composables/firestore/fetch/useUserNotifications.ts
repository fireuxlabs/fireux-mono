// Concurrent edit — 2026-07-20 15:20 CEST — Customer order notification pass: bind one owner-scoped live notification read.
// Concurrent edit — 2026-07-21 15:25 CEST — Dashboard SSR repair: bind owner notifications only after browser auth is available.
import { computed, ref, watch } from 'vue'
import { type UserNotification } from '../../../models/user-notification.model.ts'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'

export type UserNotificationRecord = UserNotification & { id: string }

const MAX_VISIBLE_NOTIFICATIONS = 50

type UserNotificationsResponse = {
  ok: true
  notifications: UserNotificationRecord[]
}

export function useUserNotifications() {
  if (import.meta.server) {
    return {
      notifications: ref<UserNotificationRecord[]>([]),
      unreadCount: ref(0),
      pending: ref(false),
      error: ref<unknown>(null),
      outcome: ref<'idle'>('idle'),
    }
  }

  const { currentUser, hasAuthState } = useAuth()
  const notifications = ref<UserNotificationRecord[]>([])
  const pending = ref(false)
  const error = ref<unknown>(null)
  const outcome = ref<'idle' | 'pending' | 'ready' | 'error'>('idle')

  const load = async () => {
    const user = currentUser.value
    if (!hasAuthState.value || !user || user.isAnonymous) {
      notifications.value = []
      pending.value = false
      error.value = null
      outcome.value = 'idle'
      return
    }

    const requestUid = user.uid
    pending.value = true
    error.value = null
    outcome.value = 'pending'
    try {
      const token = await user.getIdToken()
      const response = await $fetch<UserNotificationsResponse>(
        '/api/internal/user/notifications',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (currentUser.value?.uid !== requestUid) return
      notifications.value = response.notifications.slice(
        0,
        MAX_VISIBLE_NOTIFICATIONS
      )
      outcome.value = 'ready'
    } catch (loadError) {
      if (currentUser.value?.uid !== requestUid) return
      notifications.value = []
      error.value = loadError
      outcome.value = 'error'
    } finally {
      if (currentUser.value?.uid === requestUid) pending.value = false
    }
  }

  watch(
    [hasAuthState, computed(() => currentUser.value?.uid ?? '')],
    () => void load(),
    { immediate: true }
  )
  const unreadCount = computed(() =>
    notifications.value.reduce(
      (count: number, notification: UserNotificationRecord) =>
        count + (notification.read ? 0 : 1),
      0
    )
  )

  return {
    notifications,
    unreadCount,
    pending,
    error,
    outcome,
    refresh: load,
  }
}
