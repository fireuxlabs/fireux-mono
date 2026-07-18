<template>
  <section class="console-surface space-y-4">
    <ConsoleSupplierIndexSelected
      :supplier="selection.supplier"
      :supplier-id="selection.supplierId"
      @clear="actions.clear"
    />

    <ConsoleSupplierIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :pending="sections.targets.pending"
      :outcome="sections.targets.outcome"
      @select="actions.selectTarget"
    />

    <DevFireuxDebugPanel
      title="Supplier console debug"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleIndex } from '../../../../composables/fireux/console/supplier/index/useSupplierConsoleIndex'

const {
  selection,
  sections,
  actions,
  debug,
} = useSupplierConsoleIndex()
</script>
