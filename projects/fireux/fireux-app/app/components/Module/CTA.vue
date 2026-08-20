<template>
  <EntityIndexCta
    title="Modules"
    description="Browse reusable FireUX features you can add to apps and ecosystems."
    family="workspace"
    :actions="actions"
  />
</template>

<script setup lang="ts">
const actions = [
  {
    label: 'Project',
    cta: 'Open Project Workspace',
    to: '/workspace/project',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    label: 'Apps',
    cta: 'Browse apps',
    to: '/apps',
    icon: 'i-lucide-app-window',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/modules/learn-more',
    icon: 'i-lucide-book-open',
  },
] as const
</script>
