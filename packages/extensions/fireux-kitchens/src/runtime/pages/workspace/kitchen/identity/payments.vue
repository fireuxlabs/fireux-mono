<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.settings.payments"
    label="Payments"
    context-label="Settings"
  /><KitchenIdentityPayments />
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    hidden: true,
    key: 'workspace-kitchen-payments',
    label: 'Payments',
    group: 'Settings',
    groupDisplay: 'nested',
    icon: 'i-lucide-credit-card',
    position: 'top',
    order: 83,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
})
</script>
