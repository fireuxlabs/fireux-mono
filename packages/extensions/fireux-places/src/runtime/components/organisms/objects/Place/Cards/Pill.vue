<template>
  <UCard>
    <div class="flex items-center gap-3">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ vmTitle }}</div>
        <div v-if="vmSubtitle" class="truncate text-sm text-dimmed">
          {{ vmSubtitle }}
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  type PlaceBase,
  usePlacesInterface,
} from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  place?: PlaceBase | null
}>()

const { toCell } = usePlacesInterface()

const resolved = computed(() => (props.place ? toCell(props.place) : null))

const vmTitle = computed(() => props.title ?? resolved.value?.name ?? 'Place')
const vmSubtitle = computed(
  () => props.subtitle ?? resolved.value?.formatted_address
)
const vmAvatar = computed(() => props.avatar ?? resolved.value?.avatar ?? null)
</script>
