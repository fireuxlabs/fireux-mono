<template>
  <WorkspaceCapability collection-label="Tests">
    <template #workspace-tools>
      <WorkspaceContextTools title="Test context" :workspace="family" />
    </template>
    <template #collection-panel>
      <TestCollection
        :title="collectionTitle"
        :records="test.records.value"
        :selected-id="test.selected.value?.id"
        :pending="test.pending.value"
        :read-error="!!test.error.value"
        :create="test.create"
        @select="test.select"
      />
    </template>
    <template #single-panel>
      <TestSingle
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
import { computed } from 'vue'
import { useProjectIdentity } from '../../../composables/useProjectIdentity'
const workspaceIdentity = useProjectIdentity()
const collectionTitle = computed(() =>
  workspaceIdentity.name.value
    ? `${workspaceIdentity.name.value}’s Tests`
    : 'Tests'
)

import WorkspaceCapability from '../../../../components/Workspace/Capability.vue'
import TestCollection from '../../../../components/Workspace/Test/Collection.vue'
import TestSingle from '../../../../components/Workspace/Test/Single.vue'
import WorkspaceContextTools from '../../../../components/Workspace/ContextTools.vue'
import type { TestController } from '../../../../composables/fireux/useTest'
defineProps<{ test: TestController }>()
const family = 'project'
</script>
