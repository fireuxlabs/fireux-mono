<template>
  <OrganismsSupplierCollectionManager
    :collection="suppliers"
    title="Suppliers"
    description="Browse suppliers for the selected kitchen."
    :link="false"
  />
</template>

<script setup lang="ts">
import type { SupplierSurface } from 'fireux-suppliers/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

defineProps<{
  suppliers: SupplierSurface[]
}>()
</script>
