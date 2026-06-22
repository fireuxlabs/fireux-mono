<template>
  <section class="console-surface space-y-4">
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
