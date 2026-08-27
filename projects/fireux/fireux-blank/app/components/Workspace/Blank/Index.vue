<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Blank target outcome contract. -->
<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspaceBlankActiveCard
      :blank="blank"
      :blank-id="blankId"
      @clear="clearBlank"
    />

    <WorkspaceBlankTargets
      :collection="blanks"
      :outcome="outcome"
      @select="selectBlank"
    />

    <DevDebugPanel
      title="Blank workspace debug"
      scope="workspace"
      object-origin="fetched"
      :objects="{ selectedBlank: blank, blanks }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useBlankWorkspaceIndex } from '../../../composables/fireux/workspace/blank/index/useBlankWorkspaceIndex'

const {
  blank,
  blankId,
  blanks,
  outcome,
  selectBlank,
  clearBlank,
  debug,
} = useBlankWorkspaceIndex()
</script>
