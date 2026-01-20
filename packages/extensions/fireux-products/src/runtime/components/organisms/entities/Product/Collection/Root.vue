<template>
  <ProductCollectionManager :collection="products" />
</template>

<script setup lang="ts">
import { useProductCollection } from '../../../../../composables/fireux/firestore/objects/product/fetch/useProductCollection';

const { products } = useProductCollection()
</script>
