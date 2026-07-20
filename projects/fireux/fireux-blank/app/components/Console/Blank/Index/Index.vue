<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Blank target outcome contract. -->
<template>
  <section class="console-surface console-surface--compact">
    <ConsoleBlankIndexSelected
      :blank="selection.blank"
      :blank-id="selection.blankId"
      @clear="actions.clear"
    />

    <ConsoleBlankIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :outcome="sections.targets.outcome"
      @select="actions.selectTarget"
    />

    <DevFireuxDebugPanel
      title="Blank console debug"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useBlankConsoleIndex } from '../../../../composables/fireux/console/blank/index/useBlankConsoleIndex'

const {
  selection,
  sections,
  actions,
  debug,
} = useBlankConsoleIndex()
</script>
