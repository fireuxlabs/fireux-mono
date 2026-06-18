<template>
  <EntityIndexCta
    title="Modules index"
    description="Modules are reusable FireUX capabilities that apps and ecosystems compose."
    family="console"
    source="products collection"
    :actions="actions"
  />
</template>

<script setup lang="ts">
const actions = [
  {
    label: 'Project',
    cta: 'Open Project Console',
    to: '/console/project',
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
