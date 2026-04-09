<template>
  <UDashboardPanel id="home">
    <template #header>
      <LayoutsDashboardNavbar title="Overview" :ui="{ right: 'gap-3' }" />
    </template>

    <template #body>
      <UAlert
        color="neutral"
        variant="soft"
        title="Overview is not wired"
        description="Shared overview panels have been cleared out of core while console ownership is being simplified."
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports';

definePageMeta({
  nav: {
    key: 'console-home',
    label: 'Overview',
    icon: 'i-lucide-terminal',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  layout: 'dashboard',
})

</script>
