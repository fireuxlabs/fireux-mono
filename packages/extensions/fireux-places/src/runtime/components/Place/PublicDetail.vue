<!-- Concurrent edit — 2026-07-21 14:52 CEST — Place provenance/privacy hardening: remove public self-claim controls until verified ownership proof exists. -->
<!-- Concurrent edit — 2026-07-22 12:58 CEST — Place detail deletion: expose the guarded developer/admin removal action. -->
<template>
  <ClientOnly>
    <UPage class="place-public">
      <UPageBody class="place-public__body">
        <UPageCard v-if="pending" variant="subtle">
          <p class="text-sm text-dimmed">Loading place…</p>
        </UPageCard>

        <UPageCard
          v-else-if="!place"
          title="Place not found"
          description="This place does not exist or is not public-ready."
          variant="subtle"
        />

        <div v-else class="space-y-8">
          <section
            class="place-public__hero"
            :class="{ 'place-public__hero--covered': place.cover_image }"
            :style="heroStyle"
          >
            <img
              v-if="place.cover_image"
              :src="place.cover_image"
              :alt="`${place.name} cover`"
              class="place-public__cover"
            >
            <div class="place-public__hero-content">
              <div class="place-public__identity">
                <UAvatar
                  :src="place.image_url || undefined"
                  :alt="place.name"
                  :text="initials"
                  size="3xl"
                  class="place-public__avatar"
                />
                <div class="min-w-0 space-y-3">
                  <div class="flex flex-wrap items-center gap-2">
                    <UBadge color="neutral" variant="soft">
                      Physical place
                    </UBadge>
                    <UBadge
                      v-if="place.verified"
                      color="success"
                      variant="soft"
                      icon="i-lucide-badge-check"
                    >
                      Verified
                    </UBadge>
                  </div>
                  <div>
                    <h1>{{ place.name }}</h1>
                    <p v-if="place.brand_tagline" class="place-public__tagline">
                      {{ place.brand_tagline }}
                    </p>
                    <p v-if="place.short_address" class="place-public__location">
                      <UIcon name="i-lucide-map-pin" />
                      {{ place.short_address }}
                    </p>
                  </div>
                </div>
              </div>

              <div v-if="primaryActions.length" class="place-public__actions">
                <UButton
                  v-for="action in primaryActions"
                  :key="action.label"
                  :to="action.to"
                  :icon="action.icon"
                  target="_blank"
                  color="neutral"
                  variant="soft"
                >
                  {{ action.label }}
                </UButton>
              </div>
            </div>
          </section>

          <section class="place-public__facts" aria-label="Place details">
            <UCard v-for="fact in facts" :key="fact.label" variant="subtle">
              <div class="flex items-center gap-3">
                <UIcon :name="fact.icon" class="text-xl text-primary" />
                <div>
                  <p class="text-xs uppercase tracking-wide text-dimmed">
                    {{ fact.label }}
                  </p>
                  <p class="font-medium text-highlighted">{{ fact.value }}</p>
                </div>
              </div>
            </UCard>
          </section>

          <section v-if="place.about" class="place-public__story">
            <div>
              <p class="place-public__eyebrow">About this place</p>
              <h2>{{ place.short_name || place.name }}</h2>
            </div>
            <p>{{ place.about }}</p>
          </section>

          <section v-if="place.gallery_images?.length" class="space-y-4">
            <div>
              <p class="place-public__eyebrow">Gallery</p>
              <h2>Inside {{ place.short_name || place.name }}</h2>
            </div>
            <div class="place-public__gallery">
              <img
                v-for="(image, index) in place.gallery_images"
                :key="image"
                :src="image"
                :alt="`${place.name} gallery image ${index + 1}`"
              >
            </div>
          </section>

          <PlaceGoogleHours :place-id="place.id" />

          <PlaceDelete :place="place" />

          <!-- dev -->
          <DevJson
            :title="'Place (Public Projection)'"
            context="Place detail page · places/[id] · bounded public projection"
            :data="place"
            :default-open="false"
          />
        </div>
      </UPageBody>
    </UPage>

    <template #fallback>
      <UPage>
        <UPageHeader
          class="pageheader"
          :title="pageTitle"
          description="Saved place details."
        />

        <UPageBody class="pagebody">
          <UPageCard variant="subtle">
            <p class="text-sm text-dimmed">Loading place…</p>
          </UPageCard>
        </UPageBody>
      </UPage>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  usePlaceFetch,
  usePlaceSeo,
} from '../../composables/fireux/firestore/place/usePlace'

const props = defineProps<{
  locator: string
}>()

const locator = computed(() => String(props.locator || '').trim())
const { place, pending } = usePlaceFetch(locator)
const pageTitle = computed(() => place.value?.name || 'Place')
const initials = computed(() =>
  String(place.value?.name || 'P')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
)
const heroStyle = computed(() => {
  const palette = place.value?.brand_palette
  return {
    '--place-primary': palette?.primary_color || 'var(--ui-primary)',
    '--place-secondary': palette?.secondary_color || 'var(--ui-color-neutral-500)',
  }
})
const primaryActions = computed(() => [
  place.value?.google_maps_url
    ? { label: 'Open map', icon: 'i-lucide-map-pin', to: place.value.google_maps_url }
    : null,
  place.value?.website
    ? { label: 'Visit website', icon: 'i-lucide-external-link', to: place.value.website }
    : null,
].filter(Boolean) as Array<{ label: string; icon: string; to: string }>)
const facts = computed(() => [
  place.value?.short_name
    ? { label: 'Known as', value: place.value.short_name, icon: 'i-lucide-store' }
    : null,
  place.value?.default_currency_code
    ? { label: 'Currency', value: place.value.default_currency_code, icon: 'i-lucide-coins' }
    : null,
  place.value?.timezone
    ? { label: 'Local time', value: place.value.timezone, icon: 'i-lucide-clock-3' }
    : null,
].filter(Boolean) as Array<{ label: string; value: string; icon: string }>)

usePlaceSeo(place)
</script>

<style scoped>
.place-public__body {
  padding-top: 1.5rem;
}

.place-public__hero {
  position: relative;
  min-height: 22rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--place-primary) 28%, var(--ui-border));
  border-radius: 1.5rem;
  background: color-mix(in srgb, var(--place-primary) 10%, var(--ui-bg));
}

.place-public__cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.place-public__cover + .place-public__hero-content {
  background: rgb(0 0 0 / 58%);
  color: white;
}

.place-public__hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 22rem;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
  padding: clamp(1.5rem, 5vw, 3.5rem);
}

.place-public__hero:not(.place-public__hero--covered),
.place-public__hero:not(.place-public__hero--covered) .place-public__hero-content {
  min-height: 16rem;
}

.place-public__identity {
  display: flex;
  align-items: center;
  gap: clamp(1rem, 3vw, 2rem);
}

.place-public__avatar {
  flex: none;
  border: 3px solid color-mix(in srgb, white 76%, transparent);
  background: white;
  box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 18%);
}

.place-public h1 {
  max-width: 18ch;
  font-size: clamp(2.4rem, 7vw, 5.5rem);
  font-weight: 750;
  letter-spacing: -0.055em;
  line-height: 0.95;
}

.place-public h2 {
  font-size: clamp(1.6rem, 3vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.035em;
}

.place-public__tagline {
  margin-top: 0.75rem;
  max-width: 42rem;
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  color: color-mix(in srgb, currentColor 76%, transparent);
}

.place-public__location {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.65rem;
  color: color-mix(in srgb, currentColor 70%, transparent);
}

.place-public__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.place-public__facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 1rem;
}

.place-public__story {
  display: grid;
  gap: 1.5rem;
  padding: clamp(1.5rem, 4vw, 3rem);
  border-inline-start: 0.35rem solid var(--place-primary);
  border-radius: 0 1.25rem 1.25rem 0;
  background: var(--ui-bg-elevated);
}

.place-public__story > p {
  max-width: 65ch;
  font-size: 1.05rem;
  line-height: 1.75;
  color: var(--ui-text-muted);
  white-space: pre-line;
}

.place-public__eyebrow {
  margin-bottom: 0.4rem;
  color: var(--place-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.place-public__gallery {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.75rem;
}

.place-public__gallery img {
  grid-column: span 4;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 1rem;
  object-fit: cover;
}

.place-public__gallery img:first-child {
  grid-column: span 8;
  grid-row: span 2;
  height: 100%;
}

@media (max-width: 640px) {
  .place-public__identity {
    align-items: flex-start;
    flex-direction: column;
  }

  .place-public__gallery img,
  .place-public__gallery img:first-child {
    grid-column: 1 / -1;
  }
}
</style>
