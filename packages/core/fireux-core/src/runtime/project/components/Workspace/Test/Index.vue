<template>
  <WorkspaceCapability collection-label="Tests">
    <template #workspace-tools>
      <WorkspaceContextTools
        title="Test context"
        :workspace="family"
      />
    </template>
    <template #collection-panel>
      <TestCollection
        :records="test.records.value"
        :selected-id="test.selected.value?.id"
        :pending="test.pending.value"
        :read-error="!!test.error.value"
        :create="test.create"
        @select="test.select"
      />
    </template>
    <template #selected-panel>
      <TestIndividual
        :key="test.selected.value?.id"
        :record="test.selected.value"
        :update="test.update"
        :remove="test.remove"
      />
    </template>
    <template #workspace-open-tools>
      <WorkspaceContextTools
        title="Test workspace context"
        :workspace="family"
        open
      />
    </template>
  </WorkspaceCapability>
</template>

<script setup lang="ts">
import WorkspaceCapability from '../../../../components/Workspace/Capability.vue'
import TestCollection from '../../../../components/Workspace/Test/Collection.vue'
import TestIndividual from '../../../../components/Workspace/Test/Individual.vue'
import WorkspaceContextTools from '../../../../components/Workspace/ContextTools.vue'
import type { TestController } from '../../../../composables/fireux/useTest'
defineProps<{ test: TestController }>()
const family = 'project'
</script>
