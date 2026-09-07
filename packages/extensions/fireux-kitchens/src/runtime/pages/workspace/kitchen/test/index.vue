<template>
  <UDashboardPanel id="workspace-kitchen-test">
    <template #header><LayoutsWorkspaceNavbar title="Test" /></template>
    <template #body>
      <WorkspaceHero compact title="Kitchen Test" description="Save a string and read it back." />
      <WorkspaceKitchenSelector />
      <WorkspaceKitchenTestAI />
      <WorkspaceKitchenTest :key="test.id.value" :test="test" />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import { useKitchenTest } from '../../../../kitchen/composables/useKitchenTest'
const test = useKitchenTest()
definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-test',
    label: 'Test',
    group: 'Workspace',
    description: 'Kitchen Test',
    icon: 'i-lucide-flask-conical',
    position: 'top',
    order: 7,
    prominent: false,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
