<template>
  <UDashboardToolbar :ui="{ root: 'border-b-0' }"
    ><UTabs
      v-if="test.records.value.length"
      :model-value="test.selected.value?.id"
      :items="
        test.records.value.map((record) => ({
          label: record.value,
          value: record.id,
        }))
      "
      :content="false"
      variant="link"
      size="sm"
      aria-label="Select Test"
      @update:model-value="test.select(String($event))"
    /> </UDashboardToolbar
  ><WorkspaceHero
    compact
    title="Project Test"
    description="Save a string and read it back."
  />
  <WorkspaceProjectTestAI :test="test" />
  <WorkspaceProjectTest :key="test.id.value" :test="test" />
</template>
<script setup lang="ts">
import { useProjectWorkspaceTest } from '../../../../project/composables/workspace/test/useProjectWorkspaceTest'
const test = useProjectWorkspaceTest()
definePageMeta({
  layout: false,
  workspacePage: true,
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
