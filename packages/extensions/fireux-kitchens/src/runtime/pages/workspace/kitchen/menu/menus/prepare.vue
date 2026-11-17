<template>
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.menu.menus"
    label="Menu preparation"
    context-label="Menu"
  /><KitchenMenuMenusPrepare />
</template>
<script setup lang="ts">
import { provideKitchenMenusContext } from '../../../../../kitchen/composables/workspace/menus/useKitchenMenusContext'
provideKitchenMenusContext()
definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-menu-prepare',
    label: 'Prepare a Menu',
    description: 'Prepare a Menu from a source, review it and publish it.',
    icon: 'i-lucide-file-scan',
    group: 'Menus',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    menus: ['workspace'],
  },
})
</script>
