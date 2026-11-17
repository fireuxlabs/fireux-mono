<template>
  <KitchenContext />
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspaceHeader: 'content',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    hidden: true,
    key: 'workspace-kitchen-context',
    label: 'Context',
    description: 'Shared guidance and Kitchen and venue background.',
    group: 'Identity & brand',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-id-card',
    icon: 'i-lucide-file-text',
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
})
</script>
