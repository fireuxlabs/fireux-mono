<template>
  <KitchenMenu />
</template>

<script setup lang="ts">
import KitchenMenu from '../../../../kitchen/components/Menu/Index.vue'
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceHeader: 'content',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  requiresAuth: false,
  requiresSelection: false,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-menu-group',
    label: 'Menus',
    group: '',
    groupIndex: true,
    icon: 'i-lucide-book-open',
    position: 'top',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      {
        key: 'items',
        label: 'Items',
        to: '/workspace/kitchen/menu/items',
        icon: 'i-lucide-hamburger',
      },
      {
        key: 'promotions',
        label: 'Promotions',
        to: '/workspace/kitchen/menu/promotions',
        icon: 'i-lucide-tags',
      },
      {
        key: 'services',
        label: 'Services',
        to: '/workspace/kitchen/menu/services',
        icon: 'i-lucide-shopping-bag',
      },
    ],
  },
})
</script>
