<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.identity.operating-hours"
    label="Operating hours"
  /><WorkspaceKitchenIdentityOperatingHours />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  requiresAuth: true,
  requiresSelection: true,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    hidden: true,
    key: 'workspace-kitchen-operating-hours',
    label: 'Operating hours',
    description:
      'Venue opening hours, Kitchen working hours and offering schedules',
    group: 'Identity & brand',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-id-card',
    icon: 'i-lucide-clock',
    position: 'top',
    order: 82,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
})
</script>
