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

    <DevDebugPanel
      title="Supplier console debug"
      scope="console"
      object-origin="fetched"
      :objects="{ selectedSupplier: selection.supplier, suppliers: sections.targets.collection }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleIndex } from '../../composables/console/index/useSupplierConsoleIndex'

const {
  selection,
  sections,
  actions,
  debug,
} = useSupplierConsoleIndex()
</script>
