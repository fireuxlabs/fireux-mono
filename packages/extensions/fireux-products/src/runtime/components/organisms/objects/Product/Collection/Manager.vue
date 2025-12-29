<template>
  <slot :products="products" :total="total" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProducts } from '../../../../../composables/fireux/firestore/objects/product/useProducts'
import type { FirebaseProduct } from '../../../../../models/objects/product.model'

const { productsCollection } = await useProducts()

const products = computed<FirebaseProduct[]>(
  () => (productsCollection.value ?? []) as FirebaseProduct[]
)
const total = computed(() => products.value.length)
</script>
