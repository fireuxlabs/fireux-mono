<template>
  <section class="space-y-4">
    <ConsoleKitchenTargetsSelected
      :kitchen="selectedKitchen"
      :kitchen-id="kitchenId"
      @clear="clearSelectedKitchen"
    />

    <ConsoleKitchenTargetsLive
      :collection="kitchens.live"
      @select="actions.selectLive"
    />

    <ConsoleKitchenTargetsDemo />
    <ConsoleKitchenTargetsTest />

    <DevJson
      v-if="import.meta.dev"
      title="Kitchen console debug"
      context="misebox · /console/kitchen"
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
  kitchenId,
  debug,
  clearSelectedKitchen,
} = useKitchenConsoleIndex()
</script>
