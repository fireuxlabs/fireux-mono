<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/chef/index.vue -->
<template>
  <UDashboardPanel id="dashboard-chef-home">
    <template #header>
      <UDashboardNavbar title="Chef">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6">
        <p class="text-lg font-semibold">Hello World</p>
        <p class="text-muted mt-2 text-sm">
          Quick placeholder for the Chef dashboard overview.
        </p>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-chef-home',
    label: 'Chef',
    icon: 'i-lucide-chef-hat',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'chef',
  },
  requiresAuth: true,
})
</script>
