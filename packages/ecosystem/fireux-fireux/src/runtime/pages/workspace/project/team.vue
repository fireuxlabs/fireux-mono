<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-project-team">
      <template #header>
        <LayoutsWorkspaceNavbar title="Project Team" />
      </template>

      <template #body>
        <section class="space-y-6">
          <WorkspaceProjectTeam />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { ecosystems: ['fireux'] },
  nav: {
    key: 'workspace-project-team',
    label: 'Team',
    icon: 'i-lucide-users',
    position: 'top',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
  roles: ['admin'],
})
</script>
