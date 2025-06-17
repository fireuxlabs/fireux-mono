<template>
  <div class="page">
    <h1>Products</h1>
    <template v-if="productsCollection">
      <FireOrganismsProductCardsList :products="productsCollection" />
    </template>
    <template v-else>
      <div class="spinner">Loading products...</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useProducts } from '../../composables/firestore/objects/Product/useProducts'

const { productsCollection } = await useProducts()
</script>

<style scoped>
.spinner {
  padding: 2rem;
  text-align: center;
  color: var(--ui-text-secondary);
  font-size: 1.1rem;
}
</style>
