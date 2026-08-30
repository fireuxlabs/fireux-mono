<template>
  <ul class="collection-stack" aria-label="Apps">
    <li v-for="card in cards" :key="card.to || card.id">
      <CollectionCell
        :title="card.displayName"
        :description="card.tagline"
        :to="card.to"
      />
    </li>
  </ul>
</template>
<script setup lang="ts">
import CollectionCell from '../../../components/Collection/Cell.vue'
import type { AppCard } from '../../composables/useAppInterface'
defineProps<{ cards: AppCard.Card[] }>()
</script>
