<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <KitchenMenuItemsDetail />
</template>

<script setup lang="ts">
import { provideKitchenItemsContext } from '../../../../../kitchen/composables/workspace/items/useKitchenItemsContext'
import { provideKitchenItemPreparation } from '../../../../../kitchen/composables/workspace/items/useKitchenItemPreparation'

const context = provideKitchenItemsContext('all')
provideKitchenItemPreparation(context)

definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceHeader: 'content',
  workspaceSurface: 'detail',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-dish-detail',
    label: 'Item details',
    icon: 'i-lucide-utensils',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
})
</script>
