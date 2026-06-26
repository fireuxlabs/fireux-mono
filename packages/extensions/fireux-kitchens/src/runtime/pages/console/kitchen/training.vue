<template>
  <ConsoleKitchenSundriesParked
    panel-id="console-kitchen-training"
    title="Kitchen Training"
    alert-title="Kitchen training is parked"
    description="This kitchen console route is intentionally hidden until the training workspace is wired."
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-training',
    label: 'Training',
    icon: 'i-lucide-graduation-cap',
    position: 'top',
    hidden: true,
    parked: true,
    requiresSelection: true,
    order: 84,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
