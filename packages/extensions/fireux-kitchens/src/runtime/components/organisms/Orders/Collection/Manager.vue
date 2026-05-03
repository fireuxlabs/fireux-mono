<template>
  <OrganismsOrderCollectionManager :orders="orders" />
</template>

<script setup lang="ts">
import type { KitchenOrder } from '../../../../models/order.model'

defineProps<{
  orders: KitchenOrder[]
}>()
</script>
