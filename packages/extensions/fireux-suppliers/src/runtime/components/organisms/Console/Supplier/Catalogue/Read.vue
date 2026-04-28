<template>
  <SupplierCatalogueCollectionManager
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
}>()
</script>
