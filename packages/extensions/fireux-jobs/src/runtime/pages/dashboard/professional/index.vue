<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/index.vue -->
<template>
  <UDashboardPanel id="dashboard-professional-home">
    <template #header>
      <UDashboardNavbar title="Professional">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6">
        <p class="text-lg font-semibold">Hello World</p>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-professional-home',
    label: 'Professional',
    icon: 'i-lucide-user-star',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'professional',
  },
  requiresAuth: true,
})
</script>
