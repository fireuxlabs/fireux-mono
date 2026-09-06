<template>
  <UDashboardPanel id="workspace-kitchen-test-detail"
    ><template #header><WorkspaceKitchenNav /></template
    ><template #body
      ><WorkspaceTestDetail
        :test="test"
        route-base="/workspace/kitchen/test" /></template
  ></UDashboardPanel>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useKitchenTest } from '../../../../kitchen/composables/useKitchenTest'
const route = useRoute()
const { state } = useKitchenTest()
const testId = computed(() => String(route.params.testId || ''))
const test = computed(
  () =>
    state.value.tests.find((candidate) => candidate.id === testId.value) || null
)
definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'detail',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
