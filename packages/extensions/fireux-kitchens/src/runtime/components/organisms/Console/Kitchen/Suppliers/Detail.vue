<template>
  <div class="space-y-6">
    <UButton
      to="/console/kitchen/suppliers"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to suppliers
    </UButton>

    <SupplierProfile v-if="supplier" :supplier="supplier" />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading supplier' : 'Supplier not found'"
      :description="
        pending
          ? 'Fetching the selected kitchen supplier.'
          : `No supplier was found for ${supplierId || 'this route'}.`
      "
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen supplier detail"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleSupplier } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleSupplier'
import SupplierProfile from '../../../Supplier/Cards/Profile.vue'

const { supplier, supplierId, pending, debug } = useKitchenConsoleSupplier()
const isDev = import.meta.dev
</script>
