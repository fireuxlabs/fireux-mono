<template>
  <div class="space-y-6">
    <SupplierProductCollectionManager
      :collection="productItems"
      :pending="pending"
      :link="false"
      :dev-context="devJsonContext"
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Supplier products"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useSupplierConsoleProducts } from '../../../../../composables/fireux/console/supplier/operations/useSupplierConsoleProducts'

const {
  productItems,
  pending,
  devJsonContext,
  debug,
} = useSupplierConsoleProducts()
const isDev = import.meta.dev
</script>
