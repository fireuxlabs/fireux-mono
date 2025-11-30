<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/supplier/index.vue -->
<template>
  <UDashboardPanel id="dashboard-supplier-home">
    <template #header>
      <UDashboardNavbar title="Supplier">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6">
        <p class="text-lg font-semibold">Hello World</p>
        <p class="text-muted mt-2 text-sm">
          Placeholder content for the Supplier dashboard landing.
        </p>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-supplier-home',
    label: 'Supplier',
    icon: 'i-lucide-package',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'supplier',
  },
  requiresAuth: true,
})
</script>
