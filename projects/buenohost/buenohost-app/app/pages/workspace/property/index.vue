<template>
  <UDashboardPanel id="buenohost-property-home">
    <template #header>
      <LayoutsWorkspaceNavbar title="Property Workspace" />
      <UDashboardToolbar v-if="isSignedIn" :ui="{ root: 'border-b-0' }"
        ><WorkspacePropertySelector
      /></UDashboardToolbar>
    </template>
    <template #body>
      <WorkspaceHero
        compact
        title="Build your Property Workspace"
        description="Manage reservations, guest information and property operations."
      />
      <WorkspaceGuestWelcome />
      <WorkspaceProperty />
      <WorkspacePropertyHomeTools />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useWorkspaceEntryState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryState'
const { isSignedIn } = useWorkspaceEntryState()
import WorkspaceGuestWelcome from 'fireux-core/runtime/components/Workspace/GuestWelcome.vue'
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'workspace',
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
