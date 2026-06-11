<template>
  <div class="space-y-6">
    <SupplierCollectionManager
      :collection="suppliers"
      title="Suppliers"
      description="Browse suppliers for the selected kitchen."
      :link="true"
    />

    <DevFireuxDebugPanel
      title="Kitchen suppliers"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleSuppliers } from '../../../../../composables/fireux/console/kitchen/operations/Suppliers/useKitchenConsoleSuppliers'

const { suppliers, debug } = useKitchenConsoleSuppliers()
</script>
