<template><KitchenFoodAndDrinkPromotions /></template>
<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
  nav: {
    hidden: true,
    key: 'workspace-kitchen-promotions',
    label: 'Promotions',
    group: 'Food & drink',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-utensils',
    icon: 'i-lucide-badge-percent',
    position: 'top',
    order: 31,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
})
</script>
