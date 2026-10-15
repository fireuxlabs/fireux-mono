<template>
  <article class="space-y-8">
    <SupplierDetailHeader :supplier="supplier" :place="place" />
    <SupplierDetailCatalogue :supplier="supplier" />
    <SupplierDetailDeliveryAreas :supplier="supplier" />
    <SupplierDetailAdmin :supplier="supplier" />
  </article>
</template>

<script setup lang="ts">
import type { Supplier } from '../../models/Supplier.model'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
defineProps<{ supplier: Supplier; place: Place }>()
</script>
