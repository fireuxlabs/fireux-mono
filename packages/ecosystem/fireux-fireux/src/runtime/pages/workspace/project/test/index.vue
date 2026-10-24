<template>
  <UDashboardPanel id="workspace-project-test">
    <template #header>
      <WorkspaceNavbar title="Test" />
      <UDashboardToolbar :ui="{ root: 'border-b-0' }"><UTabs
          v-if="test.records.value.length"
          :model-value="test.selected.value?.id"
          :items="test.records.value.map(record => ({ label: record.value, value: record.id }))"
          :content="false" variant="link" size="sm" aria-label="Select Test"
          @update:model-value="test.select(String($event))"
        /></UDashboardToolbar>
    </template>
    <template #body>
      <WorkspaceHero compact title="Project Test" description="Save a string and read it back." />
      <WorkspaceProjectTestAI :test="test" />
      <WorkspaceProjectTest :key="test.id.value" :test="test" />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
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
