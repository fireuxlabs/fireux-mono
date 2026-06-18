<template>
  <div class="space-y-3">
    <PlaceCardsCell
      v-for="card in cards"
      :key="card.id"
      v-bind="card"
      :link="false"
    />

    <p v-if="!cards.length" class="text-sm text-dimmed">
      No places found.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaceInterface } from '../../../composables/fireux/firestore/place/usePlace'
import type { BasePlace } from '../../../models/place.model'

const props = defineProps<{ collection: BasePlace[] }>()
const { cell } = usePlaceInterface()
const cards = computed(() =>
  props.collection
    .map((place) => cell(place))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
</script>
