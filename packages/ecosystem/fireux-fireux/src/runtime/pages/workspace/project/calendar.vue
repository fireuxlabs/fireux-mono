<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-project-calendar">
      <template #header>
        <LayoutsWorkspaceNavbar title="Project Calendar" />
      </template>

      <template #body>
        <WorkspaceProjectCalendar />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-project-calendar',
    label: 'Calendar',
    icon: 'i-lucide-calendar-range',
    position: 'top',
    order: 2,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
