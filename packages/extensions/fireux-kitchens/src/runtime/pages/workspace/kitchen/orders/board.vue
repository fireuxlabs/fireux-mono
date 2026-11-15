<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.orders.board"
    label="Order board"
    context-label="Orders"
  /><KitchenOrdersBoard />
</template>
<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  requiresAuth: false,
  requiresSelection: false,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
