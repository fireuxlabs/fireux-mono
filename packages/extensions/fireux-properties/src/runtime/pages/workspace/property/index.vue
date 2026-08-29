<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-property-home">
      <template #header>
        <LayoutsWorkspaceNavbar title="Property Workspace" />
      </template>
      <template #body>
        <WorkspaceHero
          title="Build your Property Workspace"
          description="Manage reservations, guest information and property operations."
        />
        <WorkspaceProperty :state="state" :derived="derived" />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { usePropertyWorkspaceIndex } from '../../../property/composables/workspace/index/usePropertyWorkspaceIndex'

const { state, derived } = usePropertyWorkspaceIndex()

definePageMeta({
  layout: 'workspace',
  workspace: 'property',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'workspace-property',
    label: 'Property',
    icon: 'i-lucide-house',
    position: 'bottom',
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
