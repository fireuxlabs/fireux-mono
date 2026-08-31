<template>
  <UPageGrid
    as="ul"
    class="list-none kitchen-collection-list"
    aria-label="Kitchens"
  >
    <li v-for="cell in cells" :key="cell.to">
      <CollectionCell :cell="cell" />
    </li>
  </UPageGrid>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import CollectionCell from 'fireux-core/runtime/components/Collection/Cell.vue'
import type { CollectionCellData } from 'fireux-core/runtime/models/utils/collection-cell'
import type { KitchenCard } from '../../composables/firestore/utils/view/useKitchenInterface'

const props = defineProps<{ cards: KitchenCard.Card[] }>()
const cells = computed<CollectionCellData[]>(() =>
  props.cards.map((card) => ({
    title: card.name,
    description: card.tagline,
    image: card.discoveryImageUrl,
    imageStyle: 'cover',
    fallbackIcon: 'i-lucide-utensils',
    meta: card.shortAddress,
    badges: [...card.badges, ...card.categoryLabels],
    actionLabel: 'View Kitchen',
    to: card.to,
  }))
)
</script>

<style scoped>
.kitchen-collection-list {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
}
</style>
