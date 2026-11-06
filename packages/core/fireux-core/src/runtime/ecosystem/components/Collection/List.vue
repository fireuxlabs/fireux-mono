<template>
  <UPageGrid as="ul" aria-label="Ecosystems">
    <li v-for="cell in cells" :key="cell.to">
      <FireCollectionCell :cell="cell" />
    </li>
  </UPageGrid>
  <FireDiagnosticsDebugPanel
    title="Ecosystems collection surface"
    context="Passed Ecosystem cards and their final shared cell projection."
    object-origin="passed"
    :objects="{ cards: props.cards }"
    :derived="{ cells }"
    launcher
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import FireCollectionCell from '../../../components/Collection/Cell.vue'
import type { CollectionCellData } from '../../../models/utils/collection-cell'
import type { EcosystemDirectoryCard } from '../../composables/useEcosystemView'
const props = defineProps<{ cards: EcosystemDirectoryCard[] }>()
const cells = computed<CollectionCellData[]>(() =>
  props.cards.map((card) => ({
    title: card.title,
    description: card.subtitle,
    image: card.imageUrl,
    meta: card.meta,
    badges: card.badges,
    to: card.to,
  }))
)
</script>
