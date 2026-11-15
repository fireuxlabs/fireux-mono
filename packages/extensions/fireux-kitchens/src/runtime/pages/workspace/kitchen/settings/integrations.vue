<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.settings.integrations"
    label="Integrations"
    context-label="Settings"
  /><KitchenIntegrations />
</template>
<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspace: 'kitchen',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
