<template>
  <EntityIndexCta
    title="Projects index"
    description="Create or open a project console to organise apps, ecosystems, and operator access."
    family="console"
    source="projects collection"
    :actions="actions"
  />
</template>

<script setup lang="ts">
const actions = [
  {
    label: 'Create',
    cta: 'Create project',
    to: '/projects/create',
    icon: 'i-lucide-plus',
  },
  {
    label: 'Console',
    cta: 'Open console',
    to: '/console/project',
    icon: 'i-lucide-layout-dashboard',
  },
] as const
</script>
