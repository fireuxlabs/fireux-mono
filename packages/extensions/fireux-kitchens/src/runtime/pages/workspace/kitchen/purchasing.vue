<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-purchasing">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Purchasing" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenSundriesParked
            alert-title="Kitchen purchasing is parked"
            description="This route remains hidden until Kitchen-owned purchase orders and supplier invoices have authoritative producers."
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-purchasing',
    label: 'Purchasing',
    icon: 'i-lucide-shopping-cart',
    position: 'top',
    hidden: true,
    parked: true,
    order: 82,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
