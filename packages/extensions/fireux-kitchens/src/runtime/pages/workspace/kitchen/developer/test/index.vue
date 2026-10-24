<template>
  <UDashboardPanel id="workspace-kitchen-test">
    <template #header>
      <WorkspaceNavbar title="Test" />
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
      /></UDashboardToolbar>
    </template>
    <template #body>
      <WorkspaceHero
        compact
        title="Kitchen Test"
        description="Save a string and read it back."
      />
      <WorkspaceKitchenTestAI :test="test" />
      <WorkspaceKitchenTest :key="test.id.value" :test="test" />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import { useKitchenTest } from '../../../../../kitchen/composables/workspace/test/useKitchenTest'
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
