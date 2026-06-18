<template>
  <EntityIndexCta
    title="Properties index"
    description="Create or open a property console to manage units, stays, and property content."
    family="console"
    source="properties collection"
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
