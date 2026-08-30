<template>
  <ul class="collection-stack" aria-label="Jobs">
    <li v-for="card in cards" :key="card.to || card.id">
      <CollectionCell
        :title="card.title"
        :description="card.subtitle || card.description"
        :to="card.to"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import CollectionCell from 'fireux-core/runtime/components/Collection/Cell.vue'
import type { JobCard } from '../../composables/firestore/utils/view/useJobInterface'
defineProps<{ cards: JobCard.Card[] }>()
</script>
