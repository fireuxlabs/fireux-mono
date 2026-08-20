<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-portfolio-tasks">
      <template #header>
        <LayoutsWorkspaceNavbar title="Tasks">
          <template #right>
            <WorkspaceAICapabilityPlaceholder capability="Portfolio Tasks" />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>
      <template #body
        ><UAlert
          title="Tasks"
          description="Portfolio task tools are coming next."
          variant="soft"
      /></template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'workspace-portfolio-tasks',
    label: 'Tasks',
    icon: 'i-lucide-list-checks',
    position: 'top',
    order: 23,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
