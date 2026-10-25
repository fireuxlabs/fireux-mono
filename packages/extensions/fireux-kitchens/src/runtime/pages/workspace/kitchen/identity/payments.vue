<template>
  <WorkspaceGroupPage
    workspace="kitchen"
    nav-key="workspace-kitchen-payments"
    title="Payments"
    parent-nav-key="workspace-kitchen-settings"
  >
    <KitchenIdentityPayments />
  </WorkspaceGroupPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
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
