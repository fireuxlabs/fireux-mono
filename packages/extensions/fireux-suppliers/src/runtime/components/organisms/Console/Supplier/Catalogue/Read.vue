<template>
  <UAlert
    v-if="pending"
    color="neutral"
    variant="soft"
    title="Loading catalogue"
    description="Fetching catalogue rows for the selected supplier."
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
import { computed } from 'vue'
import type { SupplierCatalogueInterfaceItem } from '../../../../../composables/fireux/firestore/supplier/utils/view/useSupplierCatalogueItemInterface'

const props = defineProps<{
  catalogueItems: SupplierCatalogueInterfaceItem[]
  pending: boolean
}>()

const countLabel = computed(() => String(props.catalogueItems.length))
</script>
