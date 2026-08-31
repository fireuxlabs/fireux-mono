<template>
  <UPageGrid as="ul" class="list-none" aria-label="Ecosystems">
    <li v-for="cell in cells" :key="cell.to">
      <CollectionCell :cell="cell" />
    </li>
  </UPageGrid>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import CollectionCell from '../../../components/Collection/Cell.vue'
import type { CollectionCellData } from '../../../models/utils/collection-cell'
import type { EcosystemInterfaceCard } from '../../composables/useEcosystemInterface'
const props = defineProps<{ cards: EcosystemInterfaceCard[] }>()
const cells = computed<CollectionCellData[]>(() =>
  props.cards.map((card) => ({
    title: card.title,
    description: card.subtitle,
    image: card.imageUrl,
    meta: card.meta,
    badges: card.badges.filter((badge) => badge !== card.meta),
    to: card.to,
  }))
)
</script>
