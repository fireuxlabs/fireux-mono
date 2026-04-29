<template>
  <SupplierProductCollectionManager
    :collection="productItems"
    :title="title"
    :description="description"
    :empty-title="pending ? 'Loading products' : emptyTitle"
    :empty-description="
      pending
        ? 'Fetching supplier-owned product rows for the selected supplier.'
        : emptyDescription
    "
    search-placeholder="Search supplier products…"
    :link="false"
    :dev-context="devContext"
  />
</template>

<script setup lang="ts">
import type { SupplierProductInterfaceItem } from '../../../../../composables/fireux/firestore/supplier/utils/view/useSupplierProductInterface'

defineProps<{
  productItems: SupplierProductInterfaceItem[]
  pending: boolean
  title: string
  description: string
  emptyTitle: string
  emptyDescription: string
  devContext: string
}>()
</script>
