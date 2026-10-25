<script setup lang="ts">
// Concurrent edit — 2026-07-20 15:29 CEST — Customer order notification pass: render live owner notifications with read controls.
import { computed, ref, watch } from 'vue'
import { useUserNotifications } from '../../../user/composables/notifications/useUserNotifications'
import { useUserNotificationMarkRead } from '../../../user/composables/notifications/useUserNotificationMarkRead'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import NotificationItem from '../../../user/components/Notifications/Item.vue'

const open = defineModel<boolean>('open', { default: false })
const {
  notifications,
  unreadCount: liveUnreadCount,
  pending,
  error,
} = useUserNotifications()
const { markRead } = useUserNotificationMarkRead()
const markingId = ref('')
const mutationError = ref('')
const { currentUser } = useAuth(),
  config = useFireUXConfig()
const completionSources = [
  open,
  () => currentUser.value?.uid,
  () => config.appId,
]
const captureCompletion = useCommandScope(completionSources)
watch(
  completionSources,
  () => {
    markingId.value = ''
    mutationError.value = ''
  },
  { flush: 'sync' }
)
const filter = ref('all')
const visibleNotifications = computed(() =>
  notifications.value.filter(
    (item: (typeof notifications.value)[number]) =>
      filter.value !== 'unread' || !item.read
  )
)
const visibleUnreadCount = computed(
  () => notifications.value.filter((item) => !item.read).length
)
const intro = {
  title: 'Notifications',
  purpose: 'Review updates sent to you and mark them read.',
  data: 'The signed-in user’s notification feed across their activity.',
  boundaries:
    'Marking read changes your read state. This feed is not limited to the selected workspace.',
  ai: 'No AI actions are connected to this feed.',
}

async function markNotificationRead(notificationId: string) {
  if (markingId.value) return
  const isCurrent = captureCompletion()
  markingId.value = notificationId
  mutationError.value = ''
  try {
    await markRead(notificationId)
  } catch {
    if (!isCurrent()) return
    mutationError.value = 'Notification could not be updated.'
  } finally {
    if (isCurrent()) markingId.value = ''
  }
}
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Notifications"
    description="Your updates across all workspaces."
  >
    <template #body>
      <div class="mb-4 flex items-center justify-between gap-3">
        <UTabs
          v-model="filter"
          :items="[
            { label: `All (${notifications.length})`, value: 'all' },
            { label: `Unread (${visibleUnreadCount})`, value: 'unread' },
          ]"
          :content="false"
          aria-label="Filter notifications"
        />
        <WorkspaceIntroInfo :intro="intro" />
      </div>
      <p v-if="notifications.length === 50" class="mb-4 text-sm text-muted">
        Showing your latest 50 notifications. {{ liveUnreadCount }} unread in
        total.
      </p>
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

      <div
        v-else-if="!visibleNotifications.length"
        class="py-12 text-center text-sm text-muted"
      >
        <UIcon
          name="i-lucide-check-check"
          class="mx-auto mb-4 block size-8 text-primary"
        />
        {{
          filter === 'unread'
            ? liveUnreadCount > 0
              ? 'No unread notifications in the latest updates.'
              : 'You’re all caught up.'
            : 'No notifications yet.'
        }}
      </div>

      <div v-else class="space-y-3">
        <FireCopyError v-if="mutationError" :message="mutationError" />
        <UAlert
          v-if="mutationError"
          color="error"
          variant="subtle"
          :description="mutationError"
        />

        <NotificationItem
          v-for="notification in visibleNotifications"
          :key="notification.id"
          :notification="notification"
          :busy="markingId === notification.id"
          :disabled="Boolean(markingId)"
          @read="markNotificationRead(notification.id)"
        />
      </div>
    </template>
  </USlideover>
</template>
