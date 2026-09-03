<template>
  <UDashboardPanel id="workspace-project-test-detail">
    <template #header>
      <WorkspaceProjectNav />
    </template>
    <template #body>
      <WorkspaceTestDetail :test="test" route-base="/workspace/project/test" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useProjectWorkspaceTest } from '../../../../project/composables/workspace/test/useProjectWorkspaceTest'

const route = useRoute()
const { state } = useProjectWorkspaceTest()
const testId = computed(() => String(route.params.testId || ''))
const test = computed(
  () =>
    state.value.tests.find((candidate) => candidate.id === testId.value) || null
)

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'project',
  workspaceSurface: 'detail',
  visibility: { ecosystems: ['fireux'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
