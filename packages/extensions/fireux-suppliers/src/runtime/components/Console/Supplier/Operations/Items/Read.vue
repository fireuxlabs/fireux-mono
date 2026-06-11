<template>
  <div class="space-y-6">
    <SupplierItemCollectionManager
      :collection="supplierItems"
      :pending="pending"
      :link="false"
      :dev-context="devJsonContext"
    />

    <DevFireuxDebugPanel
      title="Supplier items"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useSupplierConsoleItems } from '../../../../../composables/fireux/console/supplier/operations/Items/useSupplierConsoleItems'

const {
  supplierItems,
  pending,
  devJsonContext,
  debug,
} = useSupplierConsoleItems()
</script>
