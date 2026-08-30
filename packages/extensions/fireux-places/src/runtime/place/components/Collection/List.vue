<template>
  <ul class="collection-stack" aria-label="Places">
    <li v-for="card in cards" :key="card.to || card.id">
      <CollectionCell
        :title="card.name"
        :description="card.formattedAddress"
        :to="card.to"
      />
    </li>
  </ul>
</template>
<script setup lang="ts">
import CollectionCell from 'fireux-core/runtime/components/Collection/Cell.vue'
import type { PlaceCard } from '../../composables/firestore/utils/view/usePlaceInterface'
defineProps<{ cards: PlaceCard.Card[] }>()
</script>
