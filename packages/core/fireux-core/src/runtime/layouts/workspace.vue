<template>
  <div>
    <UDashboardGroup unit="rem" class="workspace-shell">
      <WorkspaceSidebar />
      <WorkspacePage>
        <slot />
      </WorkspacePage>
    </UDashboardGroup>
    <FireLayoutsSharedRoleBadge />
    <FireLayoutsSharedNotificationsSlideover v-model:open="notificationsOpen" />
  </div>
</template>

<script setup lang="ts">
import { useUserNotifications } from '../user/composables/notifications/useUserNotifications'

const { isOpen: notificationsOpen } = useUserNotifications()
</script>
