import { useAsyncData } from 'nuxt/app'
import { computed, watch } from 'vue'
import { useState } from '#imports'

import { type UserNotification } from '../../models/user-notification.model.ts'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'

export type UserNotificationRecord = UserNotification & { id: string }

const MAX_VISIBLE_NOTIFICATIONS = 50

type UserNotificationsResponse = {
  ok: true
  notifications: UserNotificationRecord[]
  unreadCount: number
}

export function useUserNotifications() {
  const { currentUser, hasAuthState } = useAuth()
  const isOpen = useState<boolean>(
    'fireux:user:notifications-open',
    () => false
  )
  watch(
    () => currentUser.value?.uid,
    () => {
      isOpen.value = false
    },
    { flush: 'sync' }
  )
  const active = computed(() =>
    Boolean(
      hasAuthState.value && currentUser.value && !currentUser.value.isAnonymous
    )
  )
  const state = useAsyncData<UserNotificationsResponse & { ownerId: string }>(
    computed(
      () => `user-notifications:${currentUser.value?.uid || ''}:${active.value}`
    ),
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      const user = currentUser.value
      if (!active.value || !user)
        return { ok: true, notifications: [], unreadCount: 0, ownerId: '' }
      const response = await fetchRead<UserNotificationsResponse>(
        '/api/internal/user/notifications',
        {
          headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
      return { ...response, ownerId: user.uid }
    },
    { server: false }
  )
  const current = computed(() =>
    active.value &&
    !state.error.value &&
    state.data.value &&
    state.data.value.ownerId === currentUser.value?.uid
      ? state.data.value
      : null
  )
  const notifications = computed(
    () => current.value?.notifications.slice(0, MAX_VISIBLE_NOTIFICATIONS) ?? []
  )
  return {
    isOpen,
    open: () => {
      isOpen.value = true
    },
    close: () => {
      isOpen.value = false
    },
    notifications,
    unreadCount: computed(() => current.value?.unreadCount ?? 0),
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
