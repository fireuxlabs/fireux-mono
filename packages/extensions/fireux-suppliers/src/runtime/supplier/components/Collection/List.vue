<template>
  <ul class="collection-stack" aria-label="Suppliers">
    <li v-for="card in cards" :key="card.to || card.id">
      <CollectionCell
        :title="card.title"
        :description="card.subtitle || card.summary"
        :to="card.to"
      />
    </li>
  </ul>
</template>
<script setup lang="ts">
import CollectionCell from 'fireux-core/runtime/components/Collection/Cell.vue'
import type { SupplierCard } from '../../composables/firestore/utils/view/useSupplierInterface'
defineProps<{ cards: SupplierCard.Card[] }>()
</script>
