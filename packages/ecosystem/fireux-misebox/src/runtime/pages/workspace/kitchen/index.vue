<template>
  <UDashboardPanel id="workspace-kitchen-index">
    <template #header>
      <WorkspaceKitchenNav :state="state" :derived="derived" />
    </template>
    <template #body>
      <WorkspaceKitchenSelector
        :state="state"
        :derived="derived"
        :actions="actions"
      />
      <WorkspaceHero
        title="Build your Kitchen Workspace"
        description="Build and operate your Kitchen from one Workspace."
      />
      <WorkspaceKitchenIndexAI
        :workspace-state="state"
        :workspace-derived="derived"
      />
      <WorkspaceKitchen
        :state="state"
        :derived="derived"
        :actions="actions"
      />
      <WorkspaceKitchenTools :state="state" :derived="derived" />
      <WorkspaceKitchenOperations />
      <WorkspaceKitchenDiscovery />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceIndex } from 'fireux-kitchens/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceIndex'

const { state, derived, actions } = useKitchenWorkspaceIndex()

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: false,
})
</script>
