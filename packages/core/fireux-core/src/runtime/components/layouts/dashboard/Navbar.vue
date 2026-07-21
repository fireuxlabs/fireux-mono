<!-- Concurrent edit — 2026-07-20 15:26 CEST — Customer order notification pass: show the shared live unread count. -->
<!-- Concurrent edit — 2026-07-21 16:56 CEST — Dashboard Family pass: label the notification control for assistive technology. -->
<template>
  <UDashboardNavbar :title="title" :ui="ui ?? { right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <slot name="right" />

      <UTooltip :text="notificationTooltip" :shortcuts="['N']">
        <UButton
          color="neutral"
          variant="ghost"
          square
          :aria-label="notificationTooltip"
          @click="openNotifications()"
        >
          <UChip
            color="error"
            inset
            :show="unreadCount > 0"
            :text="unreadLabel"
          >
            <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
          </UChip>
        </UButton>
      </UTooltip>
    </template>
  </UDashboardNavbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsoleNotifications } from '../../../composables/fireux/app/ui/useConsoleNotifications'

defineProps<{
  title: string
  ui?: any
}>()

const {
  open: openNotifications,
  unreadCount,
} = useConsoleNotifications()
const unreadLabel = computed(() =>
  unreadCount.value > 99 ? '99+' : unreadCount.value
)
const notificationTooltip = computed(() =>
  unreadCount.value
    ? `${unreadCount.value} unread notification${unreadCount.value === 1 ? '' : 's'}`
    : 'Notifications'
)
</script>
