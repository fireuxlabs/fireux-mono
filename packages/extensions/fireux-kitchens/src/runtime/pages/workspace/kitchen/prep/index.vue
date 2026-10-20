<template>
  <WorkspaceGroupPage
    workspace="kitchen"
    nav-key="workspace-kitchen-prep"
    notice="Prep planning and batch records are not connected yet."
  ></WorkspaceGroupPage>
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
    key: 'workspace-kitchen-prep',
    label: 'Prep & Production',
    description:
      'Manage recipes, ingredients, preparation, stations and batch records.',
    groupIndex: true,
    icon: 'i-lucide-cooking-pot',
    order: 20,
    position: 'top',
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
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
      { label: 'Stations', to: '/workspace/kitchen/stations' },
      { label: 'Batches', to: '/workspace/kitchen/prep/batches' },
    ],
  },
})
</script>
