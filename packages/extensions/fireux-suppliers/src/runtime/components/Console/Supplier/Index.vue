<template>
  <section class="space-y-4">
    <ConsoleSupplierTargetsSelected
      :supplier="selectedSupplier"
      :supplier-id="supplierId"
      @clear="clearSelectedSupplier"
    />

    <ConsoleSupplierTargetsLive
      :collection="suppliers.live"
      @select="actions.selectLive"
    />

    <ConsoleSupplierTargetsDemo />
    <ConsoleSupplierTargetsTest />

    <DevJson
      v-if="import.meta.dev"
      title="Supplier console debug"
      context="supplier · /console/supplier"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleIndex } from '../../../composables/fireux/console/supplier/useSupplierConsoleIndex'

const {
  suppliers,
  actions,
  selectedSupplier,
  supplierId,
  debug,
  clearSelectedSupplier,
} = useSupplierConsoleIndex()
</script>
