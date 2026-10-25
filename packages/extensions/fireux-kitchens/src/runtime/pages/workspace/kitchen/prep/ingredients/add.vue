<template>
  <section class="space-y-4">
    <KitchenPrepAndProductionIngredientsAdd />
  </section>
</template>

<script setup lang="ts">
const breadcrumbItems = [
  {
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    to: '/workspace/kitchen/prep/ingredients',
  },
  {
    label: 'Create Ingredient',
    icon: 'i-lucide-plus',
  },
]

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
