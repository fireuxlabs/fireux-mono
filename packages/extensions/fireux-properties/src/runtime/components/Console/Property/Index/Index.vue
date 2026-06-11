<template>
  <section class="console-surface space-y-4">
    <ConsolePropertyIndexSelected
      :property="selectedProperty"
      :property-id="propertyId"
      :mode="selectedMode"
      @clear="clearSelectedProperty"
    />

    <ConsolePropertyIndexLive
      :collection="properties.live"
      @select="actions.selectLive"
    />

    <ConsolePropertyIndexDemo
      :collection="properties.demo"
      @select="actions.selectDemo"
    />
    <ConsolePropertyIndexTest :init="false" />

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
  properties,
  actions,
  selectedProperty,
  selectedMode,
  propertyId,
  debug,
  clearSelectedProperty,
} = usePropertyConsoleIndex()
</script>
