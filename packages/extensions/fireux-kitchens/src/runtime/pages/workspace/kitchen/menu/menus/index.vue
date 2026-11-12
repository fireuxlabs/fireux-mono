<template>
  <KitchenMenu />
</template>

<script setup lang="ts">
import KitchenMenu from '../../../../../kitchen/components/Menu/Index.vue'
definePageMeta({
  layout: false,
  workspacePage: true,
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
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
