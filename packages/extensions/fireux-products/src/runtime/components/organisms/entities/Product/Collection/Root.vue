<template>
  <ProductCollectionManager :collection="products" />
</template>

<script setup lang="ts">
import { useProductFetch } from '../../../../../composables/fireux/firestore/objects/product/fetch/useProductFetch';

const { products } = useProductFetch()
</script>
