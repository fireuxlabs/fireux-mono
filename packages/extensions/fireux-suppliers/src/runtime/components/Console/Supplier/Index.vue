<template>
  <section class="space-y-4">
    <ConsoleSupplierTargetsSelected
      :supplier="selectedSupplier"
      :supplier-id="supplierId"
      :mode="selectedMode"
      @clear="clearSelectedSupplier"
    />

    <ConsoleSupplierTargetsLive
      :collection="suppliers.live"
      @select="actions.selectLive"
    />

    <ConsoleSupplierTargetsDemo
      :collection="suppliers.demo"
      @select="actions.selectDemo"
    />
    <ConsoleSupplierTargetsTest :init="false" />

    <DevJson
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
  selectedMode,
  supplierId,
  debug,
  clearSelectedSupplier,
} = useSupplierConsoleIndex()
</script>
