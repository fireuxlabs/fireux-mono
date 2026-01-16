<template>
  <PlaceCollectionManager :cards="cards" :total="total" />
</template>

<script setup lang="ts">
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';

withDefaults(
  defineProps<{
    cards: PlaceCard.Card[]
    total?: number
  }>(),
  {
    total: undefined,
  }
)
</script>
