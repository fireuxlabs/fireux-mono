<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.settings.access"
    label="Access"
    context-label="Settings"
  />
  <KitchenSettingsAccess />
</template>
<script setup lang="ts">
import KitchenSettingsAccess from '../../../../kitchen/components/Settings/Access.vue'
definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
</script>
