import { computed } from 'vue'
import { useLiveAsyncData } from '../../../composables/fireux/firestore/useLiveAsyncData'
import { type UserNotification } from '../../models/user-notification.model.ts'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'

export type UserNotificationRecord = UserNotification & { id: string }

const MAX_VISIBLE_NOTIFICATIONS = 50

type UserNotificationsResponse = {
  ok: true
  notifications: UserNotificationRecord[]
}

export function useUserNotifications() {
  const { currentUser, hasAuthState } = useAuth()
  const active = computed(() =>
    Boolean(
      hasAuthState.value && currentUser.value && !currentUser.value.isAnonymous
    )
  )
  const state = useLiveAsyncData<
    UserNotificationsResponse & { ownerId: string }
  >(
    computed(
      () => `user-notifications:${currentUser.value?.uid || ''}:${active.value}`
    ),
    async (liveFetch) => {
      const user = currentUser.value
      if (!active.value || !user)
        return { ok: true, notifications: [], ownerId: '' }
      const response = await liveFetch<UserNotificationsResponse>(
        '/api/internal/user/notifications',
        {
          headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
      return { ...response, ownerId: user.uid }
    },
    { server: false }
  )
  const notifications = computed(() =>
    active.value &&
    !state.error.value &&
    state.data.value &&
    state.data.value.ownerId === currentUser.value?.uid
      ? state.data.value.notifications.slice(0, MAX_VISIBLE_NOTIFICATIONS)
      : []
  )
  return {
    notifications,
    unreadCount: computed(
      () =>
        notifications.value.filter((notification) => !notification.read).length
    ),
    pending: state.pending,
    error: state.error,
    outcome: computed(() =>
      !active.value
        ? 'idle'
        : state.pending.value
          ? 'pending'
          : state.error.value
            ? 'error'
            : 'ready'
    ),
    refresh: state.refresh,
  }
}
