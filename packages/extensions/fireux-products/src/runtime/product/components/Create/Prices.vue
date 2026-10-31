<template>
  <div class="prices-fields">
    <p class="fx-type-caption">
      Prices are optional. Leave them empty for a catalogue-only Product; adding
      prices configures checkout with the payment provider.
    </p>
    <ProductCreatePrice
      v-for="(_, index) in prices"
      :key="index"
      :index="index"
      show-remove
      @remove="removePrice(index)"
      @move-to-top="movePriceToTop(index)"
    />

    <div class="add-price">
      <UButton
        icon="i-lucide-plus"
        size="md"
        color="primary"
        variant="solid"
        label="Add price"
        @click="addPrice"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCreatePricesState } from '../../composables/create/useCreatePricesState'

const { prices, addPrice, removePrice } = useCreatePricesState()

function movePriceToTop(index: number) {
  const item = prices.value[index]
  if (item) {
    prices.value.splice(index, 1)
    prices.value.unshift(item)
  }
}
</script>

<style scoped>
.prices-fields {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
  align-items: center; /* Centers content horizontally */
}
</style>
