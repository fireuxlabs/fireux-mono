<template>
  <UDashboardPanel id="workspace-kitchen-test-detail">
    <template #header><WorkspaceNavbar title="Test" /></template>
    <template #body>
      <UButton
        to="/workspace/kitchen/developer/test"
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
import { useKitchenTest } from '../../../../../kitchen/composables/workspace/test/useKitchenTest'
const route = useRoute()
const test = useKitchenTest()
const recordId = computed(() => String(route.params.id || ''))
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
