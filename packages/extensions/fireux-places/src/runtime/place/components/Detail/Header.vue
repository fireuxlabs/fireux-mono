<template>
  <header class="place-header" data-place-header>
    <div class="place-header__body">
      <figure
        class="place-header__identity"
        :class="{ 'place-header__identity--photo': !hasBrandIdentity }"
        :style="identityStyle"
      >
        <span
          v-if="!identityImageUrl || identityImageFailed"
          aria-hidden="true"
          >{{ initials }}</span
        >
        <img
          v-else
          :src="identityImageUrl"
          :alt="hasBrandIdentity ? `${place.name} logo` : ''"
          loading="eager"
          decoding="async"
          @error="identityImageFailed = true"
        />
      </figure>
      <div class="place-header__copy">
        <div class="place-header__eyebrow">
          <span v-if="place.tagline">{{ place.tagline }}</span>
          <span v-if="place.verified" class="place-header__verified"
            ><UIcon
              name="i-lucide-badge-check"
              aria-hidden="true"
            />Verified</span
          >
        </div>
        <h1 class="place-header__title">{{ place.name }}</h1>
        <p
          v-if="place.short_address || place.formatted_address"
          class="place-header__metadata"
        >
          <UIcon name="i-lucide-map-pin" aria-hidden="true" />{{
            place.short_address || place.formatted_address
          }}
        </p>
        <PlaceOpeningHoursStatus :place="place" />
      </div>
      <div v-if="actions.length" class="place-header__actions">
        <UButton
          v-for="action in actions"
          :key="action.key"
          :to="action.to"
          :icon="action.icon"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="action.ariaLabel"
          size="lg"
          :color="action.key === 'directions' ? 'primary' : 'neutral'"
          :variant="action.key === 'directions' ? 'solid' : 'outline'"
          class="rounded-full"
          >{{ action.label }}</UButton
        >
      </div>
    </div>
    <div
      v-if="hasUsableCover || (wordmarkUrl && !wordmarkFailed)"
      class="place-header__media"
      :class="{ 'place-header__media--wordmark-only': !hasUsableCover }"
    >
      <figure v-if="hasUsableCover" class="place-header__cover">
        <img
          :src="coverUrl"
          :alt="`${place.name} cover photo`"
          loading="eager"
          decoding="async"
          fetchpriority="high"
          @error="coverFailed = true"
        />
      </figure>
      <div
        v-if="wordmarkUrl && !wordmarkFailed"
        class="place-header__wordmark"
        :style="brandStyle"
      >
        <img
          :src="wordmarkUrl"
          :alt="`${place.name} wordmark`"
          decoding="async"
          @error="wordmarkFailed = true"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Place } from '../../models/place.model.ts'
import PlaceOpeningHoursStatus from '../OpeningHours/Status.vue'
import { placeIdentityMedia } from '../../utils/place-identity-media'

defineOptions({ name: 'PlaceDetailHeader' })
const props = defineProps<{ place: Partial<Place> }>()

type PlaceDetailHeaderAction = {
  key: 'directions' | 'website'
  label: string
  ariaLabel: string
  icon: string
  to: string
}
const coverFailed = ref(false)
const identityImageFailed = ref(false)
const wordmarkFailed = ref(false)
const coverUrl = computed(() => String(props.place.cover_image || '').trim())
const identityMedia = computed(() => placeIdentityMedia(props.place))
const wordmarkUrl = computed(() =>
  String(props.place.wordmark_image || '').trim()
)
const hasUsableCover = computed(
  () => Boolean(coverUrl.value) && !coverFailed.value
)
const hasBrandIdentity = computed(
  () => identityMedia.value.imageFit === 'contain'
)
const identityImageUrl = computed(() => identityMedia.value.imageUrl)
const placeName = computed(() => String(props.place.name || '').trim())
const initials = computed(() =>
  placeName.value
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
)
const brandStyle = computed(() => {
  const background = String(props.place.media_backdrop_color || '').trim()
  return background ? { '--fx-place-media-bg': background } : undefined
})
const identityStyle = computed(() =>
  hasBrandIdentity.value ? brandStyle.value : undefined
)
const mapUrl = computed(() => {
  if (props.place.google_maps_url) return props.place.google_maps_url
  if (!props.place.short_address && !props.place.formatted_address) return ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${props.place.name}, ${props.place.short_address || props.place.formatted_address}`)}`
})
const actions = computed(
  () =>
    [
      mapUrl.value
        ? {
            key: 'directions' as const,
            label: 'Directions',
            ariaLabel: `Get directions to ${props.place.name}`,
            icon: 'i-lucide-navigation',
            to: mapUrl.value,
          }
        : null,
      props.place.website
        ? {
            key: 'website' as const,
            label: 'Website',
            ariaLabel: `Visit the ${props.place.name} website`,
            icon: 'i-lucide-external-link',
            to: props.place.website,
          }
        : null,
    ].filter(Boolean) as PlaceDetailHeaderAction[]
)

watch(coverUrl, () => {
  coverFailed.value = false
})
watch(identityImageUrl, () => {
  identityImageFailed.value = false
})
watch(wordmarkUrl, () => {
  wordmarkFailed.value = false
})
</script>

<style scoped src="../header.css"></style>
