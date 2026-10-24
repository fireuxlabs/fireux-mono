<!-- Concurrent edit — 2026-07-20 15:26 CEST — Customer order notification pass: show the shared live unread count. -->
<!-- Concurrent edit — 2026-07-21 16:56 CEST — Dashboard Family pass: label the notification control for assistive technology. -->
<template>
  <UDashboardNavbar :title="title" :ui="ui ?? { right: 'gap-3' }">
    <template #title>
      <slot name="title">{{ title }}</slot>
    </template>

    <template v-if="!showTitle" #left>
      <UDashboardSidebarCollapse class="lg:hidden" />
    </template>

    <template #leading>
      <UDashboardSidebarCollapse class="lg:hidden" />
    </template>

    <template #right>
      <UserSubscriptionControl v-if="showSubscription" />
      <slot name="right" />

      <UTooltip
        v-if="showNotifications"
        :text="notificationTooltip"
        :kbds="['N']"
      >
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
import { useWorkspaceNotifications } from '../../../workspace/composables/useWorkspaceNotifications'

withDefaults(
  defineProps<{
    title: string
    ui?: any
    showSubscription?: boolean
    showNotifications?: boolean
    showTitle?: boolean
  }>(),
  { showSubscription: true, showNotifications: true, showTitle: true }
)

const { open: openNotifications, unreadCount } = useWorkspaceNotifications()
const unreadLabel = computed(() =>
  unreadCount.value > 99 ? '99+' : unreadCount.value
)
const notificationTooltip = computed(() =>
  unreadCount.value
    ? `${unreadCount.value} unread notification${unreadCount.value === 1 ? '' : 's'}`
    : 'Notifications'
)
</script>
