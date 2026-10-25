<template>
  <UDashboardToolbar v-if="isSignedIn" :ui="{ root: 'border-b-0' }"
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
import { useWorkspaceEntryState } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryState'
const { isSignedIn } = useWorkspaceEntryState()
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
