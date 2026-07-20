<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Supplier target outcome contract. -->
<template>
  <section class="console-surface console-surface--compact">
    <ConsoleSupplierIndexSelected
      :supplier="selection.supplier"
      :supplier-id="selection.supplierId"
      @clear="actions.clear"
    />

    <ConsoleSupplierIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
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
