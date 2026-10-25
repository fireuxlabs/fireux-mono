<template><KitchenOperatingHours /></template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
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
    layouts: ['workspace'],
  },
})
</script>
