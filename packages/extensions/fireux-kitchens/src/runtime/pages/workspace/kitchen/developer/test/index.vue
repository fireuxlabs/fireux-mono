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
    title="Kitchen Test"
    description="Save a string and read it back."
  />
  <WorkspaceKitchenTestAI :test="test" />
  <WorkspaceKitchenTest :key="test.id.value" :test="test" />
</template>
<script setup lang="ts">
import { useKitchenWorkspaceTest } from '../../../../../kitchen/composables/workspace/test/useKitchenWorkspaceTest'
const test = useKitchenWorkspaceTest()
definePageMeta({
  layout: false,
  workspacePage: true,
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-test',
    label: 'Test',
    group: 'Developer',
    hidden: true,
    groupIcon: 'i-lucide-code-2',
    description: 'Kitchen Test',
    icon: 'i-lucide-flask-conical',
    position: 'top',
    order: 100,
    prominent: false,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
