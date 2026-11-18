<template>
  <KitchenWorkspaceMenu />
</template>

<script setup lang="ts">
import KitchenMenu from '../../../../../kitchen/components/Workspace/Menu/Index.vue'
definePageMeta({
  layout: 'workspace',

  workspaceHeader: 'content',
  pageTransition: false,
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    hidden: true,
    key: 'workspace-kitchen-menus',
    label: 'Menus',
    group: 'Menus',
    description: 'Organise dishes into menus, then publish and share them.',
    icon: 'i-lucide-book-open',
    position: 'top',
    order: 11,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
