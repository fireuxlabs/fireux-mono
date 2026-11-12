<template>
  <WorkspaceIntroInfo :intro="identity.intro.value" />
  <KitchenIdentity :identity="identity" />
</template>

<script setup lang="ts">
import { useKitchenWorkspaceIdentity } from '../../../../kitchen/composables/workspace/useKitchenWorkspaceIdentity'
import { watchEffect } from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
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
