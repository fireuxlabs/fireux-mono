<template>
  <UPageHeader
    title="Blank Calendar"
    description="Explore dates and scheduled work."
  />
  <WorkspaceBlankSelector />
  <WorkspaceAI compact aria-label="Blank Calendar AI"
    ><UAlert
      title="Calendar AI is not connected yet"
      color="neutral"
    /> </WorkspaceAI
  ><WorkspaceBlankCalendar />
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  pageTransition: false,
  workspace: 'blank',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-blank-calendar',
    label: 'Calendar',
    group: 'Workspace',
    icon: 'i-lucide-calendar',
    position: 'top',
    order: 1,
    desktop: false,
    mobile: false,
    menus: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
