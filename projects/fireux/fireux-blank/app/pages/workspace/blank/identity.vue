<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-blank-identity">
      <template #header
        ><WorkspaceNavbar title="Blank Identity"
      /></template>
      <template #body><WorkspaceBlankIdentity /></template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-blank-identity',
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
