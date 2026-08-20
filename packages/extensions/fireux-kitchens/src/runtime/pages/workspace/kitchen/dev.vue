<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-dev">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Dev" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenSundriesParked
            alert-title="Kitchen dev is parked"
            description="This kitchen workspace route is intentionally hidden until a workspace-owned dev workspace is needed."
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
    key: 'workspace-kitchen-dev',
    label: 'Dev',
    icon: 'i-lucide-wrench',
    position: 'top',
    hidden: true,
    parked: true,
    order: 85,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
  roles: ['developer'],
})
</script>
