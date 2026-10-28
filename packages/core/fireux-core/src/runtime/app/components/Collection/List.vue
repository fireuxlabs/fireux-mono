<template>
  <UPageGrid as="ul" class="app-collection-list" aria-label="Apps">
    <li v-for="cell in cells" :key="cell.to">
      <FireCollectionCell :cell="cell" />
    </li>
  </UPageGrid>
  <FireDiagnosticsDebugPanel
    title="Apps collection surface"
    context="Passed App cards and their final shared cell projection."
    object-origin="passed"
    :objects="{ cards: props.cards }"
    :derived="{ cells }"
    launcher
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { CollectionCellData } from '../../../models/utils/collection-cell'
import type { AppCard } from '../../composables/useAppView'

const props = defineProps<{ cards: AppCard[] }>()
const cells = computed<CollectionCellData[]>(() =>
  props.cards.map((card) => ({
    title: card.displayName,
    description: card.tagline || card.description || '',
    image: card.logoUrl || card.imageUrl,
    imageText: card.avatarText,
    to: card.to,
  }))
)
</script>

<style scoped>
.app-collection-list {
  list-style: none;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
}
</style>
