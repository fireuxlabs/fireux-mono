<!-- FILE: packages/core/fireux-core/src/runtime/pages/dashboard/app.vue -->
<template>
  <UDashboardPanel id="dashboard-app">
    <template #header>
      <UDashboardNavbar title="App Settings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <LayoutsDashboardProfileEdit class="grid gap-6 lg:grid-cols-2">
          <template #preview>
            <OrganismsAppPreview />
          </template>

          <template #core>
            <div class="rounded border border-dashed border-slate-300 p-6">
              2
            </div>
          </template>

          <template #app>
            <div class="rounded border border-dashed border-slate-300 p-6">
              3
            </div>
          </template>
        </LayoutsDashboardProfileEdit>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import OrganismsAppPreview from 'fireux-core/runtime/components/organisms/App/Preview.vue'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-app',
    label: 'App Settings',
    icon: 'i-lucide-badge-check',
    order: 10,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
