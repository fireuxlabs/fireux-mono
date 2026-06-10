<template>
  <section class="space-y-4">
    <pre>ConsoleKitchenTargetsSelected</pre>
    <ConsoleKitchenTargetsSelected
      :kitchen="selectedKitchen"
      :kitchen-id="kitchenId"
      @clear="clearSelectedKitchen"
    />

    <pre>ConsoleKitchenTargetsLive</pre>
    <ConsoleKitchenTargetsLive
      :collection="kitchens.live"
      @select="actions.selectLive"
    />

    <pre>ConsoleKitchenTargetsDemo</pre>
    <ConsoleKitchenTargetsDemo />

    <pre>ConsoleKitchenTargetsTest</pre>
    <ConsoleKitchenTargetsTest />

    <pre>DevJson</pre>
    <DevJson
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
