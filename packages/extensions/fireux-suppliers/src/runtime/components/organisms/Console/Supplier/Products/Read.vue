<template>
  <div class="space-y-6">
    <SupplierProductCollectionManager
      :collection="productItems"
      :pending="pending"
      :link="false"
      :dev-context="devJsonContext"
    />

    <DevJson
      v-if="isDev"
      title="Supplier Products Flags (JSON)"
      context="console supplier products · read"
      :data="debug"
      :default-open="false"
    />
  </div>
</template>

<script setup lang="ts">
import { useSupplierConsoleProducts } from '../../../../../composables/fireux/app/supplier-console/useSupplierConsoleProducts'

const {
  productItems,
  pending,
  devJsonContext,
  debug,
} = useSupplierConsoleProducts()
const isDev = import.meta.dev
</script>
