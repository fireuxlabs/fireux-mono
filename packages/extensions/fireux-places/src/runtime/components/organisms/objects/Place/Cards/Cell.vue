<template>
  <div class="fx-card fx-card--cell">
    <div class="fx-card__media">
      <UAvatar :src="avatar || undefined" :alt="title" size="sm" />
      <div class="fx-card__content fx-card__stack">
        <div class="fx-card__title">{{ title }}</div>
        <div v-if="subtitle" class="fx-card__subtitle">
          {{ subtitle }}
        </div>
        <div v-if="prop" class="fx-card__tagline">{{ prop }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

defineOptions({ inheritAttrs: false })

const props = defineProps<
  Pick<PlaceCard.Cell, 'place_id' | 'name' | 'formatted_address' | 'avatar' | 'source'> & { prop?: string }
>()

const title = props.name
const subtitle = props.formatted_address
const avatar = props.avatar ?? null
const prop = props.prop
</script>
