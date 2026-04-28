<template>
  <UAlert
    v-if="pending"
    color="neutral"
    variant="soft"
    title="Loading catalogue"
    description="Fetching supplier-owned product rows for the selected supplier."
  />

  <SupplierCatalogueCollectionManager
    v-else
    :collection="catalogueItems"
    title="Catalogue"
    description="Browse catalogue items for the selected supplier."
    :link="false"
  />
</template>

<script setup lang="ts">
import type { SupplierCatalogueInterfaceItem } from '../../../../../composables/fireux/firestore/supplier/utils/view/useSupplierCatalogueItemInterface'

defineProps<{
  catalogueItems: SupplierCatalogueInterfaceItem[]
  pending: boolean
}>()
</script>
