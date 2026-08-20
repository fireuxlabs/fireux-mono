<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Blank target outcome contract. -->
<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspaceBlankIndexSelected
      :blank="selection.blank"
      :blank-id="selection.blankId"
      @clear="actions.clear"
    />

    <WorkspaceBlankIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :outcome="sections.targets.outcome"
      @select="actions.selectTarget"
    />

    <DevDebugPanel
      title="Blank workspace debug"
      scope="workspace"
      object-origin="fetched"
      :objects="{ selectedBlank: selection.blank, blanks: sections.targets.collection }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useBlankWorkspaceIndex } from '../../../composables/fireux/workspace/blank/index/useBlankWorkspaceIndex'

const {
  selection,
  sections,
  actions,
  debug,
} = useBlankWorkspaceIndex()
</script>
