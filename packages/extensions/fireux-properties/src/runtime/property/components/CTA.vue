<template>
  <WorkspaceCta
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
    label: 'Workspace',
    cta: 'Open workspace',
    to: '/workspace/property',
    icon: 'i-lucide-layout-dashboard',
  },
] as const
</script>
