<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-haccp">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen HACCP" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenSundriesParked
            alert-title="Kitchen HACCP is parked"
            description="This kitchen workspace route is intentionally hidden until the HACCP workspace is wired."
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
    key: 'workspace-kitchen-haccp',
    label: 'HACCP',
    icon: 'i-lucide-clipboard-check',
    position: 'top',
    hidden: true,
    parked: true,
    order: 80,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
