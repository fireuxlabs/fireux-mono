<template>
  <section aria-labelledby="item-selling-heading">
    <h2 id="item-selling-heading">Selling</h2>
    <pre>{{ JSON.stringify(selling, null, 2) }}</pre>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenItemContext } from '../../../../../composables/items/useKitchenItemContext'

const { offer } = useKitchenItemContext()
const selling = computed(() => ({
  defaultPrice: offer.value?.price ?? null,
  sales: null,
  costPerDish: null,
  cashMarginPerDish: null,
}))
</script>
