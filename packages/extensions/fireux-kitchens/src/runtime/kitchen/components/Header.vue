<template>
  <PlaceHeader v-if="placePresentation" :place="placePresentation" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { KitchenDetailPresentation } from '../models/kitchen-detail.model.ts'

defineOptions({ name: 'KitchenHeader' })

const props = defineProps<{ kitchen: KitchenDetailPresentation | null }>()
const clean = (value: unknown) => String(value ?? '').trim()
const raw = computed(() => (props.kitchen || {}) as Record<string, any>)
const identity = computed(() =>
  raw.value.identity && typeof raw.value.identity === 'object'
    ? (raw.value.identity as Record<string, unknown>)
    : {}
)
const name = computed(
  () => clean(raw.value.display_name || raw.value.name) || 'Kitchen'
)
const placePresentation = computed<Partial<Place> | null>(() => {
  if (!props.kitchen) return null
  return {
    name: name.value,
    place_type: 'physical',
    short_name: clean(raw.value.short_name),
    tagline: clean(raw.value.tagline),
    short_address: clean(
      raw.value.short_address || raw.value.formatted_address
    ),
    image_url: clean(raw.value.image_url),
    media_backdrop_color: clean(
      identity.value.media_backdrop_color || raw.value.media_backdrop_color
    ) as `#${string}` | '',
    verified: false,
    cover_image: clean(raw.value.cover_image),
    logo_image: clean(
      identity.value.logo_image_url || raw.value.logo_image_url
    ),
    wordmark_image: clean(raw.value.wordmark_image),
    website: clean(raw.value.website),
    ...(clean(raw.value.google_maps_url)
      ? { google_maps_url: clean(raw.value.google_maps_url) }
      : {}),
  }
})
</script>
