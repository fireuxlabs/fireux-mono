<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <section class="workspace-surface workspace-surface--compact">
    <KitchenMenuItemsDetail />
  </section>
</template>

<script setup lang="ts">
import { provideKitchenDishesContext } from '../../../../../kitchen/composables/workspace/dishes/useKitchenDishesContext'
import { provideKitchenItemOrganisation } from '../../../../../kitchen/composables/workspace/dishes/useKitchenItemOrganisation'

const context = provideKitchenDishesContext('all')
provideKitchenItemOrganisation(context)

definePageMeta({
  layout: false,
  workspacePage: true,
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
