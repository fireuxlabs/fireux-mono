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

<style scoped>
.place-header {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  color: var(--ui-text-highlighted);
}
.place-header__body {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1.5rem;
}
.place-header__identity {
  width: 5rem;
  height: 5rem;
  padding: 0.8rem;
  display: grid;
  place-items: center;
  margin: 0;
  overflow: hidden;
  border-radius: 1.25rem;
  background: var(--fx-place-media-bg, var(--ui-bg-elevated));
  font-size: 1.5rem;
  font-weight: 600;
}
.place-header__identity img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.place-header__identity--photo {
  padding: 0;
}
.place-header__identity--photo img {
  object-fit: cover;
}
.place-header__copy {
  min-width: 0;
}
.place-header__eyebrow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
  margin-bottom: 0.65rem;
}
.place-header__verified {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--ui-primary);
  font-size: 0.7rem;
  letter-spacing: 0.02em;
}
.place-header__title {
  margin: 0;
  font-size: clamp(2.5rem, 5.5vw, 4.5rem);
  font-weight: 600;
  letter-spacing: -0.055em;
  line-height: 1.04;
  overflow-wrap: anywhere;
}
.place-header__metadata {
  margin: 0.85rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  color: var(--ui-text-muted);
}
.place-header__metadata > span {
  flex-shrink: 0;
}
.place-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-self: end;
  padding-bottom: 0.15rem;
}
.place-header__media {
  position: relative;
  min-width: 0;
}
.place-header__cover {
  height: clamp(17rem, 36vw, 29rem);
  margin: 0;
  overflow: hidden;
  border-radius: 1.5rem;
  background: var(--ui-bg-elevated);
}
.place-header__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.place-header__wordmark {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 11rem;
  padding: 0.8rem 1.1rem;
  border-radius: 0.75rem;
  background: var(--fx-place-media-bg, var(--ui-bg-elevated));
  box-shadow: 0 4px 24px #00000014;
}
.place-header__wordmark img {
  display: block;
  width: 100%;
  height: 2rem;
  object-fit: contain;
}
.place-header__media--wordmark-only .place-header__wordmark {
  position: static;
}
@media (max-width: 63.999rem) {
  .place-header__body {
    grid-template-columns: auto minmax(0, 1fr);
  }
  .place-header__actions {
    grid-column: 1 / -1;
  }
}
@media (max-width: 39.999rem) {
  .place-header__body {
    gap: 1rem;
  }
  .place-header__identity {
    width: 3.5rem;
    height: 3.5rem;
    padding: 0.6rem;
    border-radius: 1rem;
    align-self: start;
  }
  .place-header__eyebrow {
    font-size: 0.65rem;
    gap: 0.5rem;
  }
  .place-header__title {
    font-size: 2.3rem;
  }
  .place-header__metadata {
    line-height: 1.5;
    align-items: flex-start;
    font-size: 0.8rem;
  }
  .place-header__cover {
    height: 19rem;
    border-radius: 1rem;
  }
  .place-header__wordmark {
    bottom: 1rem;
    right: 1rem;
    width: 9rem;
  }
}
</style>
