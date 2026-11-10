<template>
  <section class="workspace-surface workspace-surface--compact">
    <KitchenPrepAndProductionIngredientsAdd />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'create',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-ingredient-add',
    label: 'Create Ingredient',
    icon: 'i-lucide-plus',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
})
</script>
