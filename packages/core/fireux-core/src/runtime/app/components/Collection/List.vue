<template>
  <UPageGrid as="ul" class="list-none app-collection-list" aria-label="Apps">
    <li v-for="cell in cells" :key="cell.to">
      <CollectionCell :cell="cell" />
    </li>
  </UPageGrid>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import CollectionCell from '../../../components/Collection/Cell.vue'
import type { CollectionCellData } from '../../../models/utils/collection-cell'
import type { AppCard } from '../../composables/useAppInterface'

const props = defineProps<{ cards: AppCard[] }>()
const cells = computed<CollectionCellData[]>(() =>
  props.cards.map((card) => ({
    title: card.displayName,
    description: card.tagline || card.description || 'Explore this FireUX App.',
    image: card.logoUrl || card.imageUrl,
    imageText: card.avatarText,
    imageStyle: 'avatar',
    meta: card.ecosystem ? `${card.ecosystem} ecosystem` : undefined,
    badges: [roleLabel(card.role)],
    actionLabel: 'View App',
    to: card.to,
  }))
)

function roleLabel(role: string) {
  if (role === 'global') return 'Platform App'
  if (role === 'tenant') return 'Ecosystem App'
  return 'Standalone App'
}
</script>

<style scoped>
.app-collection-list {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
}
</style>
