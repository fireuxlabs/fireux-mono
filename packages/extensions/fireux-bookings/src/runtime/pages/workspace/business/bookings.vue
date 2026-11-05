<template>
  <UPageHeader title="Bookings" description="Manage availability, close dates and review your customer bookings." />
  <BookingsWorkspace />
</template>
<script setup lang="ts">
definePageMeta({
  layout: false, workspacePage: true, workspace: 'business', workspaceSurface: 'capability',
  requiresAuth: true, requiresSelection: false,
  visibility: { modules: ['fireux-bookings', 'fireux-businesses'] },
  nav: { key: 'workspace-business-bookings', label: 'Bookings', icon: 'i-lucide-calendar-days', order: 860, desktop: true, mobile: true, layouts: ['workspace'] },
})
</script>
