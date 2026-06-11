<template>
  <section class="space-y-4">
    <ConsoleSupplierIndexSelected
      :supplier="selectedSupplier"
      :supplier-id="supplierId"
      :mode="selectedMode"
      @clear="clearSelectedSupplier"
    />

    <ConsoleSupplierIndexLive
      :collection="suppliers.live"
      @select="actions.selectLive"
    />

    <ConsoleSupplierIndexDemo
      :collection="suppliers.demo"
      @select="actions.selectDemo"
    />
    <ConsoleSupplierIndexTest :init="false" />

    <DevFireuxDebugPanel
      title="Supplier console debug"
      scope="console"
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
