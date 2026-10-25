<template>
  <WorkspaceGroupPage workspace="kitchen" nav-key="workspace-kitchen-identity">
    <template #header-right>
      <WorkspaceIntroInfo :intro="identity.intro.value" />
    </template>
    <WorkspaceFreemium
      family="kitchen"
      capability="identity"
      page-label="Identity"
      hide-description
      placement="top"
    />
    <KitchenIdentity :identity="identity" />
  </WorkspaceGroupPage>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceIdentity } from '../../../../kitchen/composables/workspace/useKitchenWorkspaceIdentity'
const identity = useKitchenWorkspaceIdentity()

definePageMeta({
  layout: 'workspace',
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
