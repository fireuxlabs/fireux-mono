<template>
  <ProductCollectionManager :collection="collection" />
</template>

<script setup lang="ts">
import type { FirebaseProduct } from '../../../../models/product.model';

withDefaults(
  defineProps<{
    collection: FirebaseProduct[]
  }>(),
  {}
)
</script>
