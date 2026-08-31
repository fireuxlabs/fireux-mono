<template>
  <UPageGrid as="ul" class="list-none" aria-label="Jobs">
    <li v-for="cell in cells" :key="cell.to">
      <CollectionCell :cell="cell" />
    </li>
  </UPageGrid>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CollectionCell from 'fireux-core/runtime/components/Collection/Cell.vue'
import type { CollectionCellData } from 'fireux-core/runtime/models/utils/collection-cell'
import type { JobCard } from '../../composables/firestore/utils/view/useJobInterface'
const props = defineProps<{ cards: JobCard.Card[] }>()
const cells = computed<CollectionCellData[]>(() =>
  props.cards.map((card) => ({
    title: card.title,
    description: card.subtitle || card.description,
    image: card.imageUrl,
    meta: [card.companyName, card.placeName].filter(Boolean).join(' · '),
    badges: card.badges,
    to: card.to,
  }))
)
</script>
