<template>
  <UTooltip :text="label" :kbds="kbds">
    <UButton
      color="neutral"
      variant="ghost"
      square
      :aria-label="label"
      @click="open"
    >
      <UChip color="error" inset :show="unreadCount > 0" :text="badge">
        <UIcon name="i-lucide-bell" class="user-notifications-button__icon" />
      </UChip>
    </UButton>
  </UTooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserNotifications } from '../../composables/notifications/useUserNotifications'

defineProps<{ kbds?: string[] }>()

const { unreadCount, open } = useUserNotifications()
const badge = computed(() =>
  unreadCount.value > 99 ? '99+' : unreadCount.value
)
const label = computed(() =>
  unreadCount.value
    ? `${unreadCount.value} unread notification${unreadCount.value === 1 ? '' : 's'}`
    : 'Notifications'
)
</script>

<style scoped>
.user-notifications-button__icon {
  width: calc(var(--spacing) * 5);
  height: calc(var(--spacing) * 5);
  flex-shrink: 0;
}
</style>
