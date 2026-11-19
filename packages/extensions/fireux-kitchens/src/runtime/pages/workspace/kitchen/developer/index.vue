<template>
  <WorkspacePageLinks />
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    hidden: true,
    key: 'workspace-kitchen-developer',
    label: 'Developer',
    description: 'Open Kitchen development tools.',
    group: '',
    groupIndex: true,
    icon: 'i-lucide-code-2',
    position: 'top',
    order: 99,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
})
</script>
