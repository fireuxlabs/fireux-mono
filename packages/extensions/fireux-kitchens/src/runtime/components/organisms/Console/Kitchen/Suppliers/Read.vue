<template>
  <UAlert
    v-if="pending"
    color="neutral"
    variant="soft"
    title="Loading suppliers"
    description="Fetching suppliers for the selected kitchen."
  />

  <OrganismsSupplierCollectionManager
    v-else
    :collection="suppliers"
    title="Suppliers"
    description="Browse suppliers for the selected kitchen."
    :link="false"
  />
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
