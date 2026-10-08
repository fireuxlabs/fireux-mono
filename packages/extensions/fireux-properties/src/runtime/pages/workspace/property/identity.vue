<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-property-identity">
      <template #header
        ><LayoutsWorkspaceNavbar title="Property Identity"
      /></template>
      <template #body><WorkspacePropertyIdentity /></template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'workspace-property-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
    position: 'top',
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
