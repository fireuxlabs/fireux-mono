<template>
  <UDashboardPanel id="workspace-project-test-detail">
    <template #header><LayoutsWorkspaceNavbar title="Test" /></template>
    <template #body>
      <UButton
        to="/workspace/project/test"
        label="Back to Tests"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        class="w-fit"
      />
      <WorkspaceTestDetail
        :key="`${test.id.value}:${recordId}`"
        :test="test"
        :record-id="recordId"
      />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useProjectTest } from '../../../../project/composables/useProjectTest'
const route = useRoute()
const test = useProjectTest()
const recordId = computed(() => String(route.params.id || ''))
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
