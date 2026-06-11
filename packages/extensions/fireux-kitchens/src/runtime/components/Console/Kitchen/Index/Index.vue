<template>
  <section class="space-y-4">
    <ConsoleKitchenIndexSelected
      :kitchen="selectedKitchen"
      :kitchen-id="kitchenId"
      :mode="selectedMode"
      @clear="clearSelectedKitchen"
    />

    <ConsoleKitchenIndexLive
      :collection="kitchens.live"
      @select="actions.selectLive"
    />

    <ConsoleKitchenIndexDemo
      :collection="kitchens.demo"
      @select="actions.selectDemo"
    />
    <ConsoleKitchenIndexTest :init="false" />

    <DevFireuxDebugPanel
      title="Kitchen console debug"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleIndex } from '../../../composables/fireux/console/kitchen/useKitchenConsoleIndex'

const {
  kitchens,
  actions,
  selectedKitchen,
  selectedMode,
  kitchenId,
  debug,
  clearSelectedKitchen,
} = useKitchenConsoleIndex()
</script>
