<template>
  <UCard v-if="supplier.delivery.areas.length">
    <template #header>Delivery areas</template>
    <div class="flex flex-wrap gap-2">
      <UBadge
        v-for="area in supplier.delivery.areas"
        :key="area"
        color="neutral"
        variant="soft"
      >
        {{ area }}
      </UBadge>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Supplier } from '../../models/Supplier.model'
defineProps<{ supplier: Supplier }>()
</script>
