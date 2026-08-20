<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-preview">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Preview" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenSundriesPreview />
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
    key: 'workspace-kitchen-preview',
    label: 'Preview',
    icon: 'i-lucide-eye',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
