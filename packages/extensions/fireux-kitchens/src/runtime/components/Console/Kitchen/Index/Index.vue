<template>
  <section class="console-surface console-surface--compact">
    <ConsoleKitchenIndexSelected
      :kitchen="selection.kitchen"
      :kitchen-id="selection.kitchenId"
    />

    <ConsoleKitchenIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :demo-collection="sections.demoTargets.collection"
      :pending="sections.targets.pending"
      :demo-pending="sections.demoTargets.pending"
      :selected-id="selection.kitchenId"
      :selected-source="selection.kitchenSource"
      @select="actions.selectTarget"
    />

    <DevFireuxDebugPanel
      title="Kitchen console debug"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleIndex } from '../../../../composables/fireux/console/kitchen/index/useKitchenConsoleIndex'

const {
  selection,
  sections,
  runtime,
  actions,
  debug,
} = useKitchenConsoleIndex()
</script>
