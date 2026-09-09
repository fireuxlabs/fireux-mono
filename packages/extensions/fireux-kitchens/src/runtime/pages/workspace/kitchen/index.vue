<template>
  <UDashboardPanel id="workspace-kitchen-index">
    <template #header>
      <LayoutsWorkspaceNavbar title="Kitchen Workspace" />
    </template>
    <template #body>
      <WorkspaceHero
        title="Build your Kitchen Workspace"
        description="Build and operate your Kitchen from one Workspace."
      />
      <WorkspaceKitchenSelector />
      <WorkspaceKitchenLandingAI :perform-action="performLandingAction" />
      <WorkspaceKitchen ref="workspaceSurface" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WorkspaceKitchen from '../../../kitchen/components/Workspace/Index.vue'
const workspaceSurface = ref<InstanceType<typeof WorkspaceKitchen> | null>(null)
import type { KitchenLandingIntent } from '../../../kitchen/models/landing-intent'
const performLandingAction = (intent: KitchenLandingIntent) =>
  workspaceSurface.value?.performAction(intent) ?? false
definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
