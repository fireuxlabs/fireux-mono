<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/index.vue -->
<template>
  <UDashboardPanel id="dashboard-agent-home">
    <template #header>
      <UDashboardNavbar title="Agent">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6">
        <p class="text-lg font-semibold">Hello World</p>
        <p class="text-muted mt-2 text-sm">
          This will become the Agent dashboard overview surface.
        </p>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-agent-home',
    label: 'Agent',
    icon: 'i-lucide-shield-user',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'agent',
  },
  requiresAuth: true,
})
</script>
