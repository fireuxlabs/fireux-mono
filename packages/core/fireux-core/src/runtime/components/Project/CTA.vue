<template>
  <ConsoleCta
    title="Projects"
    description="Create a project or open the console to organise apps and ecosystems."
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
