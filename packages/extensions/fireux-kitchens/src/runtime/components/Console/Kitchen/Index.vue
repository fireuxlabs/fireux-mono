<template>
  <section class="space-y-4">
    <KitchenCollectionManager
      :collection="kitchens.live"
      title="Choose Kitchen"
      description="Select the kitchen you want to work on."
      :link="false"
      :action="true"
      :show-badges="false"
      @select="actions.selectLive"
    />

    <DevJson
      v-if="isDev"
      title="Kitchen console debug"
      context="misebox · /console/kitchen"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleIndex } from '../../../composables/fireux/console/kitchen/useKitchenConsoleIndex'

const { kitchens, actions, debug } = useKitchenConsoleIndex()
const isDev = import.meta.dev
</script>
