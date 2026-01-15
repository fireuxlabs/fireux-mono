<template>
  <OrganismsObjectsProductCollectionManager :cards="cards" :total="total" />
</template>

<script setup lang="ts">
import type { ProductCard } from '../../../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface';

withDefaults(
  defineProps<{
    cards: ProductCard.Card[]
    total?: number
  }>(),
  {
    total: undefined,
  }
)
</script>
