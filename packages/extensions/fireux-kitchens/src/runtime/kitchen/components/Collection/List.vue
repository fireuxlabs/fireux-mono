<template>
  <ul class="collection-stack" aria-label="Kitchens">
    <li v-for="card in cards" :key="card.to || card.id">
      <CollectionCell
        :title="card.name"
        :description="card.shortAddress"
        :to="card.to"
      />
    </li>
  </ul>
</template>
<script setup lang="ts">
import CollectionCell from 'fireux-core/runtime/components/Collection/Cell.vue'
import type { KitchenCard } from '../../composables/firestore/utils/view/useKitchenInterface'
defineProps<{ cards: KitchenCard.Card[] }>()
</script>
