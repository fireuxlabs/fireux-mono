<template>
  <section class="space-y-4">
    <ConsolePropertyTargetsSelected
      :property="selectedProperty"
      :property-id="propertyId"
      :mode="selectedMode"
      @clear="clearSelectedProperty"
    />

    <ConsolePropertyTargetsLive
      :collection="properties.live"
      @select="actions.selectLive"
    />

    <ConsolePropertyTargetsDemo
      :collection="properties.demo"
      @select="actions.selectDemo"
    />
    <ConsolePropertyTargetsTest :init="false" />

    <DevFireuxDebugPanel
      title="Property console debug"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { usePropertyConsoleIndex } from '../../../composables/fireux/console/property/usePropertyConsoleIndex'

const {
  properties,
  actions,
  selectedProperty,
  selectedMode,
  propertyId,
  debug,
  clearSelectedProperty,
} = usePropertyConsoleIndex()
</script>
