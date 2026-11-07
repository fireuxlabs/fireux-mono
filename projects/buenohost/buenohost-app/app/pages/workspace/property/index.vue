<template>
  <UDashboardToolbar v-if="isSignedIn"
    ><WorkspacePropertySelector /> </UDashboardToolbar
  ><UPageHeader
    title="Build your Property Workspace"
    description="Manage reservations, guest information and property operations."
  />
  <WorkspaceGuestWelcome />
  <WorkspaceProperty />
  <WorkspacePropertyHomeTools />
</template>

<script setup lang="ts">
import { useAuthPhase } from 'fireux-core/runtime/composables/fireux/firebase/useAuthPhase'
const { isSignedIn } = useAuthPhase()
import WorkspaceGuestWelcome from 'fireux-core/runtime/workspace/components/GuestWelcome.vue'
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: false,
  workspacePage: true,
  pageTransition: false,
  workspace: 'property',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-property',
    label: 'Property',
    description: 'Property Workspace',
    icon: 'i-lucide-house',
    position: 'bottom',
    order: 900,
    prominent: true,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})

useSeoMeta({ title: 'Property Workspace', robots: 'noindex, nofollow' })
</script>
