<template>
  <ConsoleCta
    title="Projects"
    description="Manage your project apps, ecosystem links, identity, team access, and setup."
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
