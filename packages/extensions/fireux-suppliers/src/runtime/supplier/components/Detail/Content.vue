<template>
  <div class="grid gap-4 md:grid-cols-2">
    <UCard>
      <template #header>Status</template>
      {{ supplier.status }}
    </UCard>
    <UCard>
      <template #header>Catalogue</template>
      {{ supplier.catalogue_state }}
    </UCard>
    <UCard v-if="supplier.delivery_areas.length">
      <template #header>Delivery areas</template>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="area in supplier.delivery_areas"
          :key="area"
          color="neutral"
          variant="soft"
        >
          {{ area }}
        </UBadge>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { Supplier } from '../../models/Supplier.model'
defineProps<{ supplier: Supplier }>()
</script>
