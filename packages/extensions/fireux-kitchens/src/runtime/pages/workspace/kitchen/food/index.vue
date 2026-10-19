<template>
  <WorkspaceKitchenNavigationGroup nav-key="workspace-kitchen-food" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  requiresAuth: false,
  requiresSelection: false,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-food',
    label: 'Food & drink',
    description:
      'Manage what you sell, how it is presented and where it is available.',
    group: '',
    groupIndex: true,
    icon: 'i-lucide-utensils',
    position: 'top',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      {
        label: 'Items',
        to: '/workspace/kitchen/food/dishes',
        icon: 'i-lucide-carrot',
      },
      {
        label: 'Menus',
        to: '/workspace/kitchen/menus',
        icon: 'i-lucide-book-open',
      },
      {
        label: 'Promotions',
        to: '/workspace/kitchen/promotions',
        icon: 'i-lucide-tags',
      },
      {
        label: 'Services',
        to: '/workspace/kitchen/services',
        icon: 'i-lucide-shopping-bag',
      },
    ],
  },
})
</script>
