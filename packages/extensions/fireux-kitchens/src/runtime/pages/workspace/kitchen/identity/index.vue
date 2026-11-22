<template>
  <WorkspaceIntroInfo :intro="identity.intro.value" />
  <WorkspaceKitchenAIFocus
    focus="kitchen-ai.identity"
    label="Identity &amp; brand"
  />
  <WorkspaceKitchenIdentity :identity="identity" />
</template>

<script setup lang="ts">
import { useKitchenWorkspaceIdentity } from '../../../../kitchen/composables/workspace/identity/useKitchenWorkspaceIdentity'
import { watchEffect } from 'vue'
import { useWorkspacePageState } from 'fireux-workspace/runtime/workspace/composables/useWorkspacePageState'
const identity = useKitchenWorkspaceIdentity()
const page = useWorkspacePageState('kitchen')
watchEffect(() =>
  page.publish({
    identity: { placeId: identity.placeId.value, ...identity.fields.value },
    derived: {
      status: identity.status.value,
      availableActions: identity.availableActions.value,
    },
  })
)

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
