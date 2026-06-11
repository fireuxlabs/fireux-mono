<template>
  <section class="console-surface space-y-4">
    <ConsoleKitchenIndexSelected
      :kitchen="selection.kitchen"
      :kitchen-id="selection.kitchenId"
      :mode="selection.mode"
      @clear="actions.clear"
    />

    <ConsoleKitchenIndexLive
      v-if="sections.live.show"
      :collection="sections.live.collection"
      @select="actions.selectLive"
    />

    <ConsoleKitchenIndexDemo
      v-if="sections.demo.show"
      :collection="sections.demo.collection"
      @select="actions.selectDemo"
    />
    <ConsoleKitchenIndexTest
      v-if="sections.test.show"
      :init="sections.test.init"
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
  actions,
  debug,
} = useKitchenConsoleIndex()
</script>
