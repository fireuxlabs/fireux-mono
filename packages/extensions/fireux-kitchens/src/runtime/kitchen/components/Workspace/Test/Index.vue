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
        :to="`/workspace/kitchen/test/${encodeURIComponent(test.selected.value?.id || '')}`"
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
import { useKitchenWorkspacePlace } from '../../../composables/workspace/identity/useKitchenWorkspacePlace'
const workspaceIdentity = useKitchenWorkspacePlace()
const collectionTitle = computed(() =>
  workspaceIdentity.place.value?.name
    ? `${workspaceIdentity.place.value.name}’s Tests`
    : 'Tests'
)

import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
import TestCollection from 'fireux-core/runtime/components/Workspace/Test/Collection.vue'
import TestSingle from 'fireux-core/runtime/components/Workspace/Test/Single.vue'
import WorkspaceContextTools from 'fireux-core/runtime/components/Workspace/ContextTools.vue'
import type { TestController } from 'fireux-core/runtime/composables/fireux/useTest'
defineProps<{ test: TestController }>()
const family = 'kitchen'
</script>
