<template>
  <KitchenPrepAndProductionLibraryRead view="preparations" :selected-id="id" />
</template>
<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
const id = useRouteParam('preparationId')
definePageMeta({
  layout: 'workspace',

  workspaceHeader: 'content',
  workspaceSurface: 'detail',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-preparations-detail',
    label: 'Preparations',
    hidden: true,
  },
})
</script>
