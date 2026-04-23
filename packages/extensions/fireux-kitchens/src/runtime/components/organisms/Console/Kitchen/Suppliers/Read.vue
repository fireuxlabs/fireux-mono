<template>
  <ConsoleKitchenChildLayout
    description="Selected kitchen and supplier collection in scope."
    item-label="Suppliers"
    :item-count="countLabel"
    :pending="pending"
    pending-title="Loading suppliers"
    pending-description="Fetching suppliers for the selected kitchen."
  >
    <OrganismsSupplierCollectionManager
      :collection="suppliers"
      title="Suppliers"
      description="Browse suppliers for the selected kitchen."
      :link="false"
    />
  </ConsoleKitchenChildLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SupplierSurface } from 'fireux-suppliers/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

const props = defineProps<{
  suppliers: SupplierSurface[]
  pending: boolean
}>()

const countLabel = computed(() => String(props.suppliers.length))
</script>
