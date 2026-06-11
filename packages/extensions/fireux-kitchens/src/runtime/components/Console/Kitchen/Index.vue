<template>
  <section class="space-y-4">
    <ConsoleKitchenTargetsSelected
      :kitchen="selectedKitchen"
      :kitchen-id="kitchenId"
      :mode="selectedMode"
      @clear="clearSelectedKitchen"
    />

    <ConsoleKitchenTargetsLive
      :collection="kitchens.live"
      @select="actions.selectLive"
    />

    <ConsoleKitchenTargetsDemo
      :collection="kitchens.demo"
      @select="actions.selectDemo"
    />
    <ConsoleKitchenTargetsTest :init="false" />

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
