<template>
  <header
    class="public-entity-hero"
    :class="{ 'public-entity-hero--covered': hasCoverStage }"
    data-public-entity-hero
  >
    <figure
      v-if="hasCoverStage"
      class="public-entity-hero__cover"
    >
      <div
        class="public-entity-hero__cover-fallback"
        aria-hidden="true"
      >
        <UIcon :name="fallbackIcon" />
      </div>
      <img
        v-if="!coverFailed"
        :src="coverSrc"
        :alt="resolvedCoverAlt"
        loading="eager"
        decoding="async"
        fetchpriority="high"
        @error="coverFailed = true"
      >
    </figure>

    <div
      class="public-entity-hero__sheet"
      :class="{
        'public-entity-hero__sheet--has-badges': $slots.badges,
        'public-entity-hero__sheet--has-actions': $slots.actions,
      }"
    >
      <div
        class="public-entity-hero__identity-image"
        :class="`public-entity-hero__identity-image--${imageFit}`"
        :style="identityImageStyle"
      >
        <span
          v-if="!imageSrc || imageFailed"
          aria-hidden="true"
        >
          {{ resolvedInitials }}
        </span>
        <img
          v-if="imageSrc && !imageFailed"
          :src="imageSrc"
          :alt="resolvedImageAlt"
          :loading="hasCoverStage ? 'lazy' : 'eager'"
          decoding="async"
          @error="imageFailed = true"
        >
      </div>

      <div
        v-if="$slots.badges"
        class="public-entity-hero__badges"
      >
        <slot name="badges" />
      </div>

      <div class="public-entity-hero__copy">
        <p
          v-if="eyebrow"
          class="public-entity-hero__eyebrow fx-type-label"
        >
          {{ eyebrow }}
        </p>
        <h1 class="public-entity-hero__title fx-type-display-title">
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="public-entity-hero__description fx-type-description"
        >
          {{ description }}
        </p>
        <p
          v-if="visibleSummary"
          class="public-entity-hero__summary fx-type-body"
        >
          {{ visibleSummary }}
        </p>
        <p
          v-if="location"
          class="public-entity-hero__location"
        >
          <UIcon
            name="i-lucide-map-pin"
            aria-hidden="true"
          />
          <span>{{ location }}</span>
        </p>
      </div>

      <div
        v-if="$slots.actions"
        class="public-entity-hero__actions"
      >
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

defineOptions({ name: 'PublicEntityHero' })

type PublicEntityImageFit = 'contain' | 'cover'

const props = withDefaults(
  defineProps<{
    coverAlt?: string
    coverUrl?: string
    description?: string
    eyebrow?: string
    fallbackIcon?: string
    imageAlt?: string
    imageFit?: PublicEntityImageFit
    imageUrl?: string
    initials?: string
    location?: string
    mediaBackground?: string
    summary?: string
    title: string
  }>(),
  {
    coverAlt: '',
    coverUrl: '',
    description: '',
    eyebrow: '',
    fallbackIcon: 'i-lucide-image',
    imageAlt: '',
    imageFit: 'cover',
    imageUrl: '',
    initials: '',
    location: '',
    mediaBackground: '',
    summary: '',
  }
)

const coverFailed = ref(false)
const imageFailed = ref(false)

const coverSrc = computed(() => String(props.coverUrl || '').trim())
const imageSrc = computed(() => String(props.imageUrl || '').trim())
const hasCoverStage = computed(() => Boolean(coverSrc.value))
const resolvedCoverAlt = computed(() => String(props.coverAlt || '').trim())
const resolvedImageAlt = computed(() => String(props.imageAlt || '').trim())
const identityImageStyle = computed(() => {
  const background = String(props.mediaBackground || '').trim()
  return background
    ? { '--fx-public-entity-media-bg': background }
    : undefined
})
const resolvedInitials = computed(() => {
  const supplied = String(props.initials || '').trim()
  if (supplied) return supplied.slice(0, 3).toUpperCase()

  return (
    String(props.title || '')
      .trim()
      .split(/\s+/u)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || '—'
  )
})
const visibleSummary = computed(() => {
  const summary = String(props.summary || '').trim()
  const description = String(props.description || '').trim()
  return summary && summary !== description ? summary : ''
})

watch(coverSrc, () => {
  coverFailed.value = false
})

watch(imageSrc, () => {
  imageFailed.value = false
})
</script>

<style scoped src="./EntityHero.css"></style>
