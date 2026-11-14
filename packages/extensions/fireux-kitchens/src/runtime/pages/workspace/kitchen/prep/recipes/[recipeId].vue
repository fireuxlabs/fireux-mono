<template>
  <KitchenPrepAndProductionLibraryRead view="recipes" :selected-id="id" />
</template>
<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
const id = useRouteParam('recipeId')
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceHeader: 'content',
  workspaceSurface: 'detail',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-recipes-detail',
    label: 'Recipes',
    hidden: true,
  },
})
</script>
