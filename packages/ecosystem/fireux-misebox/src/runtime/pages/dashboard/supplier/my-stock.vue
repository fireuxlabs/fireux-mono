<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/supplier/my-stock.vue -->
<template>
  <UDashboardPanel id="dashboard-supplier-my-stock">
    <template #header>
      <UDashboardNavbar title="My Stock">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <section class="space-y-6 p-6">
        <UAlert
          icon="i-lucide-box"
          color="neutral"
          title="My Stock"
          description="Inventory, restock alerts, and analytics will eventually surface here."
        />
        <UCard>
          <p class="text-sm text-muted">
            Placeholder content. Replace with supply chain data when the API is ready.
          </p>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-supplier-stock',
    label: 'My Stock',
    icon: 'i-lucide-box',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'supplier',
  },
  requiresAuth: true,
})
</script>
