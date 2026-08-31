<template>
  <UPageGrid as="ul" class="list-none" aria-label="Users">
    <li v-for="cell in cells" :key="cell.to">
      <CollectionCell :cell="cell" />
    </li>
  </UPageGrid>
  <DevDebugPanel
    title="Users collection surface"
    context="Passed User cards and their final shared cell projection."
    object-origin="passed"
    :objects="{ cards: props.cards }"
    :derived="{ cells }"
    launcher
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import CollectionCell from '../../../components/Collection/Cell.vue'
import type { CollectionCellData } from '../../../models/utils/collection-cell'
import type { UserCard } from '../../composables/useUserInterface'
const props = defineProps<{ cards: UserCard[] }>()
const cells = computed<CollectionCellData[]>(() =>
  props.cards.map((card) => ({
    title: card.displayName,
    description:
      card.summary || card.bio || `View ${card.displayName}'s profile.`,
    image: card.imageUrl,
    imageText: card.displayName.slice(0, 2).toUpperCase(),
    imageStyle: 'avatar',
    meta: card.handle
      ? card.handle.startsWith('@')
        ? card.handle
        : `@${card.handle}`
      : '',
    badges: card.badges,
    actionLabel: 'View profile',
    to: card.to,
  }))
)
</script>
