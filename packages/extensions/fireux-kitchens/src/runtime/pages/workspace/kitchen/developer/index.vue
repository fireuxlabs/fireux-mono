<template>
  <KitchenGroupIndex nav-key="workspace-kitchen-developer"></KitchenGroupIndex>
</template>
<script setup lang="ts">
import KitchenGroupIndex from '../../../../kitchen/components/Workspace/GroupIndex.vue'
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-developer',
    label: 'Developer',
    description:
      'Open Kitchen development tools. Test records are separate from operational Kitchen data.',
    group: 'Developer',
    groupDisplay: 'nested',
    groupIndex: true,
    groupIcon: 'i-lucide-code-2',
    icon: 'i-lucide-code-2',
    position: 'top',
    order: 99,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
})
</script>
