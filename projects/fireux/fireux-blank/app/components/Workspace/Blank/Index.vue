<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Blank target outcome contract. -->
<template>
  <WorkspaceCapability collection-label="Blanks" single-label="Details">
    <template #collection-panel>
      <WorkspaceBlankTargets
        :collection="collection"
        :outcome="outcome"
        @select="select"
      />
    </template>
    <template #single-panel>
      <WorkspaceBlankActiveCard
        :blank="blank"
        :blank-id="selectedId"
        @clear="clear"
      />
    </template>
  </WorkspaceCapability>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
import { useBlankWorkspaceIndex } from '../../../composables/fireux/workspace/blank/index/useBlankWorkspaceIndex'

const { collection, selectedId, outcome, select, clear } =
  useBlankWorkspaceIndex()
const blank = computed(
  () => collection.value.find((item) => item.id === selectedId.value) ?? null
)
</script>
