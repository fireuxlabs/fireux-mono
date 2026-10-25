<template>
  <WorkspaceAICapabilityPlaceholder capability="Property Calendar" />
  <WorkspaceHero
    compact
    title="Property Calendar"
    description="View scheduled property activity."
  />
  <WorkspacePropertySelector />
  <WorkspaceAI compact aria-label="Property Calendar AI"
    ><UAlert
      title="Calendar AI is not connected yet"
      color="neutral"
    /> </WorkspaceAI
  ><UAlert
    title="Calendar events are not connected"
    description="Install the reservation capability to view property bookings."
    color="neutral"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'workspace-property-calendar',
    label: 'Calendar',
    icon: 'i-lucide-calendar-range',
    position: 'top',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
