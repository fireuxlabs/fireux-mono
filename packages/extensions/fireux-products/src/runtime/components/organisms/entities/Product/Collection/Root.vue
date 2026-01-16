<template>
  <ProductCollectionManager :cards="cards" :total="total" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductCollection } from '../../../../../composables/fireux/firestore/objects/product/fetch/useProductCollection'
import { useProductInterface } from '../../../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface'

const { products } = useProductCollection()
const { card: makeCard } = useProductInterface()

const cards = computed(() =>
  (products.value ?? [])
    .map((product) => makeCard(product))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const total = computed(() => cards.value.length)
</script>
