<template>
  <WorkspaceIntroInfo :intro="identity.intro.value" />
  <WorkspaceFreemium
    family="kitchen"
    capability="identity"
    page-label="Identity"
    hide-description
    placement="top"
  />
  <KitchenIdentity :identity="identity" />
</template>

<script setup lang="ts">
import { useKitchenWorkspaceIdentity } from '../../../../kitchen/composables/workspace/useKitchenWorkspaceIdentity'
const identity = useKitchenWorkspaceIdentity()

definePageMeta({
  layout: false,
  workspacePage: true,
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
    layouts: ['workspace'],
    children: [
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
