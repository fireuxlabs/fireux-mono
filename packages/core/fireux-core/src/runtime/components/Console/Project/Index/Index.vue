<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Project target outcome contract. -->
<template>
  <section class="console-surface console-surface--compact">
    <ConsoleProjectIndexSelected
      :project="selection.project"
      :project-id="selection.projectId"
      @clear="actions.clear"
    />

    <ConsoleProjectIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :outcome="sections.targets.outcome"
      @select="actions.selectTarget"
    />

    <DevFireuxDebugPanel
      title="Project console debug"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleIndex } from '../../../../composables/fireux/console/project/index/useProjectConsoleIndex'

const {
  selection,
  sections,
  actions,
  debug,
} = useProjectConsoleIndex()
</script>
