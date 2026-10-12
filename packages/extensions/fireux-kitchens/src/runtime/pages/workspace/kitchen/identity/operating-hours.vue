<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-operating-hours">
      <template #header
        ><LayoutsWorkspaceNavbar title="Operating hours"
      /></template>
      <template #body>
        <div class="workspace-profile">
          <UBreadcrumb
            class="mb-4"
            :ui="{ list: 'flex-wrap' }"
            :items="[
              { label: 'Identity', to: '/workspace/kitchen/identity' },
              { label: 'Operating hours' },
            ]"
          /><WorkspaceKitchenOperatingHours />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  requiresAuth: true,
  requiresSelection: true,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-operating-hours',
    label: 'Operating hours',
    description:
      'Venue opening hours, Kitchen working hours and offering schedules',
    group: 'Identity',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-id-card',
    icon: 'i-lucide-clock',
    position: 'top',
    order: 82,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
})
</script>
