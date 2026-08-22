<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-today">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Today" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenOverview />
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
    key: 'workspace-kitchen-today',
    label: 'Today',
    group: 'Workspace',
    icon: 'i-lucide-calendar-check',
    position: 'top',
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
