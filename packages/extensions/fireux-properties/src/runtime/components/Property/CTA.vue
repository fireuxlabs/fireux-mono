<template>
  <EntityIndexCta
    title="Properties"
    description="Create a property or open the console to manage units, stays, and content."
    family="console"
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
