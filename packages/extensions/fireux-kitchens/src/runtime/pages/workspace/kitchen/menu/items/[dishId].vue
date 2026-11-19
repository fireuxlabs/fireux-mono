<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <KitchenWorkspaceMenuItemsDetail />
</template>

<script setup lang="ts">
import KitchenWorkspaceMenuItemsDetail from '../../../../../kitchen/components/Workspace/Menu/Items/Detail/Index.vue'

definePageMeta({
  layout: 'workspace',

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
    menus: ['workspace'],
  },
})
</script>
