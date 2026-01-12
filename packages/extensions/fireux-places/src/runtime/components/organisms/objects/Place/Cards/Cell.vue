<template>
  <div class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title"
        size="sm"
        icon="i-lucide-map-pin"
      />
      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__title flex items-center justify-between gap-2">
          <span class="truncate">{{ title }}</span>
          <UBadge v-if="sourceLabel" variant="soft" color="neutral" size="xs">
            {{ sourceLabel }}
          </UBadge>
        </div>
        <div v-if="subtitle" class="fx-cell__subtitle">
          {{ subtitle }}
        </div>
        <div v-if="prop" class="fx-cell__tagline">{{ prop }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

defineOptions({ inheritAttrs: false })

type Props = {
  id: PlaceCard.Cell['id']
  name: PlaceCard.Cell['name']
  formatted_address: PlaceCard.Cell['formatted_address']
  imageUrl: PlaceCard.Cell['imageUrl']
  source: PlaceCard.Cell['source']
  prop?: string
}

const props = defineProps<Props>()

const title = computed(() => props.name)
const subtitle = computed(() => props.formatted_address)
const imageUrl = computed(() => props.imageUrl || '')
const prop = computed(() => props.prop)
const sourceLabel = computed(() =>
  props.source === 'firebase'
    ? 'Firebase'
    : props.source === 'google'
      ? 'Google'
      : null
)
</script>
