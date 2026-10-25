<template>
  <WorkspaceAICapabilityPlaceholder capability="Property Reservations" />
  <UAlert
    title="Reservations"
    description="Property reservation tools are coming next."
    variant="soft"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'workspace-property-reservations',
    label: 'Reservations',
    icon: 'i-lucide-calendar-days',
    position: 'top',
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
