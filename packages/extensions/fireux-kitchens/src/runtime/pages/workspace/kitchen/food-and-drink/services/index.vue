<template><KitchenFoodAndDrinkServices /></template>
<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    hidden: true,
    key: 'workspace-kitchen-services',
    label: 'Services',
    group: 'Food & drink',
    description: 'Choose menus and serving hours for each service.',
    icon: 'i-lucide-shopping-bag',
    position: 'top',
    order: 12,
    layouts: ['workspace'],
    desktop: true,
    mobile: true,
  },
})
</script>
