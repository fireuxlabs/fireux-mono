<template>
  <PlaceHeader v-if="placePresentation" :place="placePresentation" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PublicPlaceDetailProjection } from 'fireux-places/runtime/models/place-public.model'
import type { KitchenSurface } from '../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

defineOptions({ name: 'KitchenHeader' })

const props = defineProps<{ kitchen: KitchenSurface | null }>()
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
const placePresentation = computed<PublicPlaceDetailProjection | null>(() => {
  if (!props.kitchen) return null
  const gallery = Array.isArray(raw.value.food_gallery)
    ? raw.value.food_gallery.map(clean).filter(Boolean)
    : []
  return {
    id: clean(raw.value.place_id || raw.value.id),
    name: name.value,
    place_type: 'physical',
    short_name: clean(raw.value.short_name),
    brand_tagline: clean(raw.value.tagline || raw.value.brand_tagline),
    short_address: clean(
      raw.value.short_address || raw.value.formatted_address
    ),
    image_url: clean(raw.value.image_url),
    media_backdrop_color: clean(
      identity.value.media_backdrop_color || raw.value.media_backdrop_color
    ) as `#${string}` | '',
    image_shade: 'none',
    verified: false,
    slug: clean(raw.value.slug),
    about: clean(raw.value.about),
    cover_image: clean(raw.value.cover_image),
    gallery_images: gallery,
    logo_image: clean(
      identity.value.logo_image_url || raw.value.logo_image_url
    ),
    wordmark_image: clean(raw.value.wordmark_image),
    business_hours: { windows: [] },
    website: clean(raw.value.website),
    ...(clean(raw.value.google_maps_url)
      ? { google_maps_url: clean(raw.value.google_maps_url) }
      : {}),
  }
})
</script>
