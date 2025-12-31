<template>
  <UCard>
    <div class="flex items-center gap-3">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ vmTitle }}</div>
        <div v-if="vmSubtitle" class="truncate text-sm text-dimmed">
          {{ vmSubtitle }}
        </div>
        <div v-if="prop" class="truncate text-sm text-dimmed">{{ prop }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  PlaceBase,
  PlaceCard,
} from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import { usePlacesInterface } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  place?: PlaceBase | PlaceCard.Cell | null
  prop?: string
}>()
const { toCell } = usePlacesInterface()

const resolved = computed<PlaceCard.Cell | null>(() => {
  const source = props.place
  if (!source) return null
  if ('place_id' in source && 'source' in source) return source as PlaceCard.Cell
  return toCell(source as PlaceBase)
})

const vmTitle = computed(() => props.title ?? resolved.value?.name ?? 'Place')
const vmSubtitle = computed(
  () => props.subtitle ?? resolved.value?.formatted_address
)
const vmAvatar = computed(() => props.avatar ?? resolved.value?.avatar ?? null)
</script>
