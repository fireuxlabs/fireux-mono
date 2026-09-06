<template>
  <UDashboardPanel id="workspace-project-test">
    <template #header><LayoutsWorkspaceNavbar title="Test" /></template>
    <template #body>
      <p class="text-muted">Save a string and read it back.</p>
      <WorkspaceTest
        :key="test.id.value"
        :workspace="{ id: test.id.value, family: 'project' }"
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
import { useProjectTest } from '../../../../project/composables/useProjectTest'
const test = useProjectTest()
definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'project',
  workspaceSurface: 'browse',
  visibility: { ecosystems: ['fireux'] },
  nav: {
    key: 'workspace-project-test',
    label: 'Test',
    group: 'Workspace',
    description: 'Project Test',
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
