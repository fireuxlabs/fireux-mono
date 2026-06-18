<template>
  <ConsoleCta
    title="Properties"
    description="Manage your property identity, units, stays, content, team access, and guest operations."
    :actions="actions"
  />
</template>

<script setup lang="ts">
const actions = [
  {
    label: 'Create',
    cta: 'Create property',
    to: '/properties/create',
    icon: 'i-lucide-plus',
  },
  {
    label: 'Console',
    cta: 'Open console',
    to: '/console/property',
    icon: 'i-lucide-layout-dashboard',
  },
] as const
</script>
