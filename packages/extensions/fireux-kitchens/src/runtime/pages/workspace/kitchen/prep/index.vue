<template>
  <KitchenWorkspacePrep />
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspaceHeader: 'content',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-prep',
    label: 'Prep & Production',
    description:
      'Manage preparations, recipes, prep plans, batches, ingredients and stations.',
    groupIndex: true,
    icon: 'i-lucide-cooking-pot',
    order: 20,
    position: 'top',
    desktop: true,
    mobile: true,
    menus: ['workspace'],
    children: [
      {
        label: 'Preparations',
        to: '/workspace/kitchen/prep/preparations',
        icon: 'i-lucide-cooking-pot',
      },
      {
        label: 'Prep plan',
        to: '/workspace/kitchen/prep/plan',
        icon: 'i-lucide-clipboard-list',
      },
      {
        label: 'Recipes',
        to: '/workspace/kitchen/prep/recipes',
        icon: 'i-lucide-book-open',
      },
      {
        label: 'Ingredients',
        to: '/workspace/kitchen/prep/ingredients',
        icon: 'i-lucide-carrot',
      },
      { label: 'Stations', to: '/workspace/kitchen/prep/stations' },
      { label: 'Batches', to: '/workspace/kitchen/prep/batches' },
    ],
  },
})
</script>
