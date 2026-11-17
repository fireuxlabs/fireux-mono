<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.orders.board"
    label="Order board"
    context-label="Orders"
  /><WorkspaceKitchenOrdersBoard />
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  requiresAuth: false,
  requiresSelection: false,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
