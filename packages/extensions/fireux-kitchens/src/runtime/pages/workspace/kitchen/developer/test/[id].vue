<template>
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
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useKitchenWorkspaceTest } from '../../../../../kitchen/composables/workspace/test/useKitchenWorkspaceTest'
const route = useRoute()
const test = useKitchenWorkspaceTest()
const recordId = computed(() => String(route.params.id || ''))
definePageMeta({
  layout: false,
  workspacePage: true,
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'detail',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
