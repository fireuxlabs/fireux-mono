<script setup lang="ts">
// Concurrent edit — 2026-07-20 15:20 CEST — Customer order notification pass: render live owner notifications with read controls.
import { ref } from 'vue'
import { useUserNotifications } from '../../../composables/fireux/firestore/core/user/fetch/useUserNotifications'
import { useUserNotificationRead } from '../../../composables/fireux/firestore/core/user/mutations/useUserNotificationRead'
import {
  formatFirestoreTimestamp,
  type FirestoreTimestampLike,
} from '../../../utils/formatTimestamp'

const open = defineModel<boolean>('open', { default: false })
const { notifications, pending, error } = useUserNotifications()
const { markRead } = useUserNotificationRead()
const markingId = ref('')
const mutationError = ref('')

const timestampLabel = (value: FirestoreTimestampLike) =>
  formatFirestoreTimestamp(value, { fallback: '' }) || ''

async function markNotificationRead(notificationId: string) {
  if (markingId.value) return
  markingId.value = notificationId
  mutationError.value = ''
  try {
    await markRead(notificationId)
  } catch {
    mutationError.value = 'Notification could not be updated.'
  } finally {
    markingId.value = ''
  }
}
</script>

<template>
  <USlideover v-model:open="open" title="Notifications">
    <template #body>
      <div v-if="pending" class="space-y-3">
        <USkeleton v-for="index in 3" :key="index" class="h-24" />
      </div>

      <UAlert
        v-else-if="error"
        color="error"
        variant="subtle"
        title="Notifications unavailable"
        description="Please try again shortly."
      />

      <div v-else-if="!notifications.length" class="text-sm text-dimmed">
        No notifications.
      </div>

      <div v-else class="space-y-3">
        <UAlert
          v-if="mutationError"
          color="error"
          variant="subtle"
          :description="mutationError"
        />

        <UCard
          v-for="notification in notifications"
          :key="notification.id"
          variant="subtle"
        >
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-3">
              <p class="text-sm">{{ notification.message }}</p>
              <UBadge
                v-if="!notification.read"
                color="primary"
                variant="soft"
                size="xs"
              >
                New
              </UBadge>
            </div>

            <div class="flex items-center justify-between gap-3">
              <span class="text-xs text-dimmed">
                {{ timestampLabel(notification.created?.at) }}
              </span>
              <UButton
                v-if="!notification.read"
                label="Mark read"
                color="neutral"
                variant="link"
                size="xs"
                :loading="markingId === notification.id"
                :disabled="Boolean(markingId)"
                @click="markNotificationRead(notification.id)"
              />
            </div>
          </div>
        </UCard>
      </div>
    </template>

    <template #footer>
      <UButton
        to="/dashboard/customer/profile"
        label="My orders"
        icon="i-lucide-receipt-text"
        block
        @click="open = false"
      />
    </template>
  </USlideover>
</template>
