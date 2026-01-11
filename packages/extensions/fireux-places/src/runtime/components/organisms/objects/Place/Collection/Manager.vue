<template>
  <slot :cells="cells" :total="total" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaces } from '../../../../../composables/fireux/firestore/objects/place/usePlaces'
import {
  usePlacesInterface,
  type PlaceEntity,
} from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

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
const places = computed<PlaceEntity[]>(() => (collection.value ?? []) as PlaceEntity[])

const { toCell } = usePlacesInterface()

const cells = computed(() =>
  (places.value ?? []).map((place: PlaceEntity) => toCell(place))
)

const total = computed(() => cells.value.length)
</script>
