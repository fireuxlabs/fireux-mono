<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.identity.appearance"
    label="Appearance"
  /><WorkspaceKitchenIdentityAppearance />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',

  requiresAuth: true,
  requiresSelection: true,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    hidden: true,
    key: 'workspace-kitchen-appearance',
    label: 'Appearance',
    description: 'Menu colours and a preview of your public menu',
    group: 'Identity & brand',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-id-card',
    icon: 'i-lucide-palette',
    position: 'top',
    order: 83,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
})
</script>
