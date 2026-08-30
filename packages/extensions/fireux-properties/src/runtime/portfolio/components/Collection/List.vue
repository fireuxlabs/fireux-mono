<template>
  <ul class="collection-stack" aria-label="Portfolios">
    <li v-for="card in cards" :key="card.to || card.id">
      <CollectionCell
        :title="card.title"
        :description="card.subtitle"
        :to="card.to"
      />
    </li>
  </ul>
</template>
<script setup lang="ts">
import CollectionCell from 'fireux-core/runtime/components/Collection/Cell.vue'
import type { PortfolioCard } from '../../composables/firestore/utils/view/usePortfolioInterface'
defineProps<{ cards: PortfolioCard.Card[] }>()
</script>
