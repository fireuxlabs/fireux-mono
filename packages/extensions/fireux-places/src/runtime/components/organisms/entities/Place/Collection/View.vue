<template>
  <PlaceCollectionManager :cards="cards" />
</template>

<script setup lang="ts">
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';

defineProps<{ cards: PlaceCard.Card[] }>()
</script>
