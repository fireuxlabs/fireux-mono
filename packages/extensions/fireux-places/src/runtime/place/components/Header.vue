<template>
  <header
    class="place-header"
    :class="{ 'place-header--covered': hasUsableCover }"
    data-place-header
  >
    <figure v-if="hasUsableCover" class="place-header__cover">
      <img
        :src="coverUrl"
        alt=""
        loading="eager"
        decoding="async"
        fetchpriority="high"
        @error="coverFailed = true"
      />
    </figure>

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
        <div class="place-header__title-line">
          <h1 class="place-header__title fx-type-display-title">
            {{ place.name }}
          </h1>
          <UBadge
            v-if="place.verified"
            color="success"
            variant="solid"
            size="sm"
            icon="i-lucide-badge-check"
            >Verified</UBadge
          >
        </div>
        <UBadge v-if="hasShortName" color="neutral" variant="soft" size="sm"
          >Also known as {{ place.short_name }}</UBadge
        >
        <p
          v-if="place.brand_tagline"
          class="place-header__description fx-type-description"
        >
          {{ place.brand_tagline }}
        </p>
        <div class="place-header__metadata">
          <span v-if="place.short_address"
            ><UIcon name="i-lucide-map-pin" aria-hidden="true" />{{
              place.short_address
            }}</span
          >
          <span
            ><UIcon name="i-lucide-circle-dot" aria-hidden="true" />{{
              placeTypeLabel
            }}</span
          >
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
            size="md"
            :color="action.key === 'directions' ? 'primary' : 'neutral'"
            :variant="action.key === 'directions' ? 'solid' : 'soft'"
            >{{ action.label }}</UButton
          >
        </div>
      </div>
    </div>

    <div
      v-if="wordmarkUrl && !wordmarkFailed"
      class="place-header__wordmark"
      :style="identityStyle"
    >
      <img
        :src="wordmarkUrl"
        :alt="`${place.name} wordmark`"
        loading="eager"
        decoding="async"
        @error="wordmarkFailed = true"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PlaceHeaderPresentation } from '../models/place-presentation.model.ts'

defineOptions({ name: 'PlaceHeader' })
const props = defineProps<{ place: PlaceHeaderPresentation }>()

type PlaceHeaderAction = {
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
const imageUrl = computed(() => String(props.place.image_url || '').trim())
const logoUrl = computed(() =>
  String(props.place.logo_image || props.place.image_url || '').trim()
)
const wordmarkUrl = computed(() =>
  String(props.place.wordmark_image || '').trim()
)
const hasUsableCover = computed(
  () => Boolean(coverUrl.value) && !coverFailed.value
)
const hasBrandIdentity = computed(() =>
  Boolean(wordmarkUrl.value || props.place.logo_image)
)
const identityImageUrl = computed(() =>
  hasBrandIdentity.value ? logoUrl.value : imageUrl.value
)
const hasShortName = computed(
  () =>
    Boolean(props.place.short_name) &&
    props.place.short_name.localeCompare(props.place.name, undefined, {
      sensitivity: 'base',
    }) !== 0
)
const initials = computed(() =>
  props.place.name
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
)
const identityStyle = computed(() => {
  const background = String(
    props.place.media_backdrop_color ||
      props.place.brand_palette?.primary_color ||
      ''
  ).trim()
  return background ? { '--fx-place-media-bg': background } : undefined
})
const placeTypeLabel = computed(() =>
  props.place.place_type === 'non_physical'
    ? 'Non-physical place'
    : 'Physical place'
)
const mapUrl = computed(() => {
  if (props.place.google_maps_url) return props.place.google_maps_url
  if (!props.place.short_address) return ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${props.place.name}, ${props.place.short_address}`)}`
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
    ].filter(Boolean) as PlaceHeaderAction[]
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

<style scoped src="./header.css"></style>
