<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Blank target outcome contract. -->
<template>
  <WorkspaceCapability collection-label="Blanks" single-label="Details">
    <template #collection-panel>
      <WorkspaceBlankHomeCollection
        :collection="collection"
        :outcome="outcome"
        @select="select"
      />
    </template>
    <template #single-panel>
      <WorkspaceBlankHomeSingle :blank="blank" :blank-id="id" />
    </template>
  </WorkspaceCapability>
</template>

<script setup lang="ts">
import WorkspaceCapability from 'fireux-core/runtime/workspace/components/Capability.vue'
import { useBlankWorkspace } from '../../../composables/workspace/useBlankWorkspace'

const {
  collection,
  id,
  data: blank,
  collectionOutcome: outcome,
  select,
} = useBlankWorkspace()
</script>
