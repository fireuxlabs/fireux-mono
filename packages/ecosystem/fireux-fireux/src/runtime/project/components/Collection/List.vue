<template>
  <UPageGrid as="ul" class="list-none" aria-label="Projects">
    <li v-for="cell in cells" :key="cell.to">
      <CollectionCell :cell="cell" />
    </li>
  </UPageGrid>
  <DevDebugPanel
    title="Projects collection surface"
    context="Passed Project cards and their final shared cell projection."
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
export type ProjectCollectionCard = {
  to: string
  title: string
  subtitle?: string
  imageUrl?: string
}
const props = defineProps<{ cards: ProjectCollectionCard[] }>()
const cells = computed<CollectionCellData[]>(() =>
  props.cards.map((card) => ({
    title: card.title,
    description: card.subtitle,
    image: card.imageUrl,
    to: card.to,
  }))
)
</script>
