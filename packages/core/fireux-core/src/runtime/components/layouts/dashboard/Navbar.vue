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

      <UserNotificationsButton v-if="showNotifications" :kbds="['N']" />
    </template>
  </UDashboardNavbar>
</template>

<script setup lang="ts">
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
</script>
