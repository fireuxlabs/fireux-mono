<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Property target outcome contract. -->
<template>
  <section class="console-surface console-surface--compact">
    <ConsolePropertyIndexSelected
      :property="selection.property"
      :property-id="selection.propertyId"
      @clear="actions.clear"
    />

    <ConsolePropertyIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :outcome="sections.targets.outcome"
      @select="actions.selectTarget"
    />

    <DevFireuxDebugPanel
      title="Property console debug"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { usePropertyConsoleIndex } from '../../../../composables/fireux/console/property/index/usePropertyConsoleIndex'

const {
  selection,
  sections,
  actions,
  debug,
} = usePropertyConsoleIndex()
</script>
