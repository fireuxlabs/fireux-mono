<template>
  <UDashboardPanel id="workspace-kitchen-test">
    <template #header><LayoutsWorkspaceNavbar title="Test" /></template>
    <template #body>
      <p class="text-muted">Save a string and read it back.</p>
      <WorkspaceTest
        :key="test.id.value"
        :workspace="{ id: test.id.value, family: 'kitchen' }"
        :records="test.records.value ?? []"
        :pending="test.pending.value"
        :read-error="!!test.error.value"
        :create="test.create"
        :update="test.update"
        :remove="test.remove"
      />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import WorkspaceTest from 'fireux-core/runtime/components/Workspace/Test/Index.vue'
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
