<template>
  <div class="fx-card fx-card--cell">
    <div class="fx-card__media">
      <UAvatar
        :src="avatar || undefined"
        :alt="title"
        size="sm"
        icon="i-lucide-map-pin"
      />
      <div class="fx-card__content fx-card__stack">
        <div class="fx-card__title flex items-center justify-between gap-2">
          <span class="truncate">{{ title }}</span>
          <UBadge v-if="sourceLabel" variant="soft" color="neutral" size="xs">
            {{ sourceLabel }}
          </UBadge>
        </div>
        <div v-if="subtitle" class="fx-card__subtitle">
          {{ subtitle }}
        </div>
        <div v-if="prop" class="fx-card__tagline">{{ prop }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

defineOptions({ inheritAttrs: false })

const props = defineProps<
  Pick<PlaceCard.Cell, 'place_id' | 'name' | 'formatted_address' | 'avatar' | 'source'> & { prop?: string }
>()

const title = computed(() => props.name)
const subtitle = computed(() => props.formatted_address)
const avatar = computed(() => props.avatar ?? null)
const prop = computed(() => props.prop)
const sourceLabel = computed(() =>
  props.source === 'firestore'
    ? 'Firestore'
    : props.source === 'google'
      ? 'Google'
      : null
)
</script>
