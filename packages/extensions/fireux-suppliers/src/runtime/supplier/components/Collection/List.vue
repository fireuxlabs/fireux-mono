<template>
  <UPageGrid as="ul" class="list-none" aria-label="Suppliers">
    <li v-for="cell in cells" :key="cell.to">
      <CollectionCell :cell="cell" />
    </li>
  </UPageGrid>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import CollectionCell from 'fireux-core/runtime/components/Collection/Cell.vue'
import type { CollectionCellData } from 'fireux-core/runtime/models/utils/collection-cell'
import type { SupplierCard } from '../../composables/firestore/utils/view/useSupplierInterface'
const props = defineProps<{ cards: SupplierCard.Card[] }>()
const cells = computed<CollectionCellData[]>(() =>
  props.cards.map((card) => ({
    title: card.title,
    description: card.subtitle || card.summary,
    image: card.imageUrl,
    meta: card.locationLabel || card.categoriesCsv,
    badges: card.badges,
    to: card.to,
  }))
)
</script>
