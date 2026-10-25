<template>
  <UPageGrid as="ul" class="list-none" aria-label="Portfolios">
    <li v-for="cell in cells" :key="cell.to">
      <FireCollectionCell :cell="cell" />
    </li>
  </UPageGrid>
  <FireDiagnosticsDebugPanel
    title="Portfolios collection surface"
    context="Passed Portfolio cards and their final shared cell projection."
    object-origin="passed"
    :objects="{ cards: props.cards }"
    :derived="{ cells }"
    launcher
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import FireCollectionCell from 'fireux-core/runtime/components/Collection/Cell.vue'
import type { CollectionCellData } from 'fireux-core/runtime/models/utils/collection-cell'
import type { PortfolioCard } from '../../composables/firestore/utils/view/usePortfolioInterface'
const props = defineProps<{ cards: PortfolioCard.Card[] }>()
const cells = computed<CollectionCellData[]>(() =>
  props.cards.map((card) => ({
    title: card.title,
    description: card.subtitle || card.summary,
    image: card.imageUrl,
    meta: card.locationLabel || card.regionLabel,
    badges: card.badges,
    to: card.to,
  }))
)
</script>
