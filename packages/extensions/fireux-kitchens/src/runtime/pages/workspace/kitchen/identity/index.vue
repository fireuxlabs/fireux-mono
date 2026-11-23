<template>
  <WorkspacePageHeader title="Identity & brand" />
  <KitchenIdentity v-if="kitchen" :key="kitchen.id" :kitchen="kitchen" />
  <FireState v-else :outcome="outcome" :error="error" entity="Kitchen" />
</template>

<script setup lang="ts">
import KitchenIdentity from '../../../../kitchen/components/Workspace/Identity/Index.vue'
import { useKitchenWorkspace } from '../../../../kitchen/composables/workspace/useKitchenWorkspace'

const { data: kitchen, outcome, error } = useKitchenWorkspace()

definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',

  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-identity',
    label: 'Identity & brand',
    group: '',
    description: 'Manage your Kitchen listing, venue profile and brand.',
    groupIndex: true,
    groupIcon: 'i-lucide-id-card',
    icon: 'i-lucide-id-card',
    position: 'top',
    order: 1,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
    children: [
      {
        label: 'Context',
        to: '/workspace/kitchen/identity/context',
        icon: 'i-lucide-file-text',
      },
      {
        label: 'Operating hours',
        to: '/workspace/kitchen/identity/operating-hours',
        icon: 'i-lucide-clock',
      },
      {
        label: 'Appearance',
        to: '/workspace/kitchen/identity/appearance',
        icon: 'i-lucide-palette',
      },
    ],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
