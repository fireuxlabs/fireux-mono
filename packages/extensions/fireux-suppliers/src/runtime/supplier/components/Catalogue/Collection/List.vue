<template>
  <div class="collection-stack">
    <template v-for="card in cards" :key="card.to || card.id">
      <slot name="pill" :card="card" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SupplierCatalogueItemCard } from '../../../composables/firestore/utils/view/useSupplierCatalogueInterface'

defineProps<{
  cards: SupplierCatalogueItemCard.Card[]
}>()
</script>
