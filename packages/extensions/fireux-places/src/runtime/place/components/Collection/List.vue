<template>
  <UPageGrid as="ul" class="list-none" aria-label="Places">
    <li v-for="cell in cells" :key="cell.to">
      <CollectionCell :cell="cell" />
    </li>
  </UPageGrid>
  <DevDebugPanel
    title="Places collection surface"
    context="Passed Place cards and their final shared cell projection."
    object-origin="passed"
    :objects="{ cards: props.cards }"
    :derived="{ cells }"
    launcher
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import CollectionCell from 'fireux-core/runtime/components/Collection/Cell.vue'
import type { CollectionCellData } from 'fireux-core/runtime/models/utils/collection-cell'
import type { PlaceCard } from '../../composables/firestore/utils/view/usePlaceInterface'
const props = defineProps<{ cards: PlaceCard.Card[] }>()
const cells = computed<CollectionCellData[]>(() =>
  props.cards.map((card) => ({
    title: card.name,
    description: card.description,
    image: card.coverImageUrl || card.imageUrl,
    imageStyle: 'cover',
    fallbackIcon: 'i-lucide-map-pin',
    meta: card.shortAddress || card.formattedAddress,
    badges: [...card.badges, ...card.categoryLabels],
    actionLabel: 'View Place',
    to: card.to,
  }))
)
</script>
