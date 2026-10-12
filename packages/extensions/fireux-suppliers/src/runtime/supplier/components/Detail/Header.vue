<template>
  <div class="space-y-6">
    <UButton
      to="/suppliers"
      label="All Suppliers"
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="ghost"
    />
    <PlaceHeader :place="place" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Supplier } from '../../models/Supplier.model'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { useSupplierSeo } from '../../composables/useSupplierSeo'
const props = defineProps<{ supplier: Supplier; place: Place }>()
useSupplierSeo(
  computed(() => props.supplier),
  computed(() => props.place)
)
</script>
