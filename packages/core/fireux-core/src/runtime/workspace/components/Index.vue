<template>
  <UDashboardGroup unit="rem" class="workspace-shell">
    <WorkspaceSidebar />
    <WorkspacePage />
  </UDashboardGroup>
  <LayoutsSharedRoleBadge />
  <LayoutsSharedNotificationsSlideover v-model:open="notificationsOpen" />
</template>

<script setup lang="ts">
import { useUserNotifications } from '../../user/composables/notifications/useUserNotifications'
const { isOpen: notificationsOpen } = useUserNotifications()
</script>
