<template>
  <div v-if="variant === 'pill'" class="collection-grid">
    <PlaceCardsPill
      v-for="card in cards"
      :key="card.to || card.id"
      :avatar-url="card.avatarUrl"
      :title="card.title"
      :subtitle="card.subtitle"
      :badges="card.badges"
    />
  </div>

  <div v-else class="collection-stack">
    <PlaceCardsCell
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="true"
    />
  </div>
</template>

<script setup lang="ts">
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';

withDefaults(
  defineProps<{
    cards: PlaceCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
