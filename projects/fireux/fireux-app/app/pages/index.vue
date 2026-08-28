<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="fireux-project-home">
      <template #header>
        <LayoutsWorkspaceNavbar title="Project Workspace" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceProject />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspace: 'project',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-project',
    label: 'Current Project',
    description: 'My Project',
    icon: 'i-lucide-briefcase-business',
    position: 'bottom',
    order: 900,
    prominent: true,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
