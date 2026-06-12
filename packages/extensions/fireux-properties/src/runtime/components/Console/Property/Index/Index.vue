<template>
  <section class="console-surface space-y-4">
    <ConsolePropertyIndexSelected
      :property="selection.property"
      :property-id="selection.propertyId"
      @clear="actions.clear"
    />

    <ConsolePropertyIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :pending="sections.targets.pending"
      @select="actions.selectTarget"
    />

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
  selection,
  sections,
  actions,
  debug,
} = usePropertyConsoleIndex()
</script>
