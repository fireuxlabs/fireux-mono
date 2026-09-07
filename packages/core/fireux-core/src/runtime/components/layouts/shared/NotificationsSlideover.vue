<script setup lang="ts">
// Concurrent edit — 2026-07-20 15:29 CEST — Customer order notification pass: render live owner notifications with read controls.
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceNotifications } from '../../../composables/fireux/workspace/useWorkspaceNotifications'
import { useUserNotifications } from '../../../user/composables/firestore/fetch/useUserNotifications'
import { useUserNotificationRead } from '../../../user/composables/firestore/mutations/useUserNotificationRead'
import NotificationItem from '../../../user/components/Notifications/Item.vue'

const open = defineModel<boolean>('open', { default: false })
const router = useRouter()
const {
  notifications,
  unreadCount: liveUnreadCount,
  pending,
  error,
} = useUserNotifications()
const { markRead } = useUserNotificationRead()
const { setUnreadCount } = useWorkspaceNotifications()
const markingId = ref('')
const mutationError = ref('')
const filter = ref('all')
const visibleNotifications = computed(() =>
  notifications.value.filter(
    (item: (typeof notifications.value)[number]) =>
      filter.value !== 'unread' || !item.read
  )
)
const intro = {
  title: 'Notifications',
  purpose: 'Review updates sent to you and mark them read.',
  data: 'The signed-in user’s notification feed across their activity.',
  boundaries:
    'Marking read changes your read state. This feed is not limited to the selected workspace.',
  ai: 'No AI actions are connected to this feed.',
}
const myOrdersAvailable = computed(
  () => router.resolve('/dashboard/customer/profile').matched.length > 0
)

watch(liveUnreadCount, setUnreadCount, { immediate: true })

async function markNotificationRead(notificationId: string) {
  if (markingId.value) return
  markingId.value = notificationId
  mutationError.value = ''
  try {
    await markRead(notificationId)
    const notification = notifications.value.find(
      (item: (typeof notifications.value)[number]) => item.id === notificationId
    )
    if (notification) notification.read = true
  } catch {
    mutationError.value = 'Notification could not be updated.'
  } finally {
    markingId.value = ''
  }
}
</script>

<template>
  <USlideover v-model:open="open" title="Notifications" description="Your updates across all workspaces.">
    <template #body>
      <div class="mb-4 flex items-center justify-between gap-3">
        <UTabs
          v-model="filter"
          :items="[
            { label: `All (${notifications.length})`, value: 'all' },
            { label: `Unread (${liveUnreadCount})`, value: 'unread' },
          ]"
          :content="false"
          aria-label="Filter notifications"
        />
        <WorkspaceIntroInfo :intro="intro" />
      </div>
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

      <div v-else-if="!visibleNotifications.length" class="py-12 text-center text-sm text-muted">
        <UIcon name="i-lucide-check-check" class="mx-auto mb-4 block size-8 text-primary" />
        {{
          filter === 'unread'
            ? 'You’re all caught up.'
            : 'No notifications yet.'
        }}
      </div>

      <div v-else class="space-y-3">
        <MoleculesCopyError v-if="mutationError" :message="mutationError" />
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

    <template #footer>
      <UButton
        v-if="myOrdersAvailable"
        to="/dashboard/customer/profile"
        label="My orders"
        icon="i-lucide-receipt-text"
        block
        @click="open = false"
      />
    </template>
  </USlideover>
</template>
