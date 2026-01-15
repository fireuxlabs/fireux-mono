<template>
  <slot :cards="cards" :total="total" :places="places" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlaces } from '../../../../../composables/fireux/firestore/objects/place/usePlaces';
import { usePlacesInterface } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';
import type { BasePlace } from '../../../../../models/objects/place.model';

const props = withDefaults(
  defineProps<{
    keyword?: string | null
    type?: string | null
  }>(),
  {
    keyword: null,
    type: null,
  }
)

const keyword = computed<string | null>(() => props.keyword ?? null)
const type = computed<string | null>(() => props.type ?? null)

const { collection } = usePlaces<Record<string, any>>({ keyword, type })

// Keep raw Firestore payload for consumers (e.g. dev drift tooling)
const places = computed<Record<string, any>[]>(() => collection.value ?? [])
const placesBase = computed<BasePlace[]>(() => places.value as BasePlace[])

const { card: makeCard } = usePlacesInterface()

const cards = computed(() =>
  (placesBase.value ?? [])
    .map((place) => makeCard(place))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const total = computed(() => cards.value.length)
</script>
