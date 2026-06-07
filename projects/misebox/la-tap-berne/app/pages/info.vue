<template>
  <LaTapBernePageSurface
    title="Information."
    :subtitle="pageSubtitle"
  >
    <div class="latap-page-copy">
      <p v-if="pending">Loading venue information...</p>
      <p v-else-if="!place">Venue information is not available right now.</p>
      <template v-else>
        <p>{{ formattedAddress }}</p>
        <p v-if="phone">Call {{ phone }}</p>
        <p v-if="website">{{ websiteLabel }}</p>
      </template>
    </div>

    <a
      class="latap-info-misebox"
      href="https://misebox.app/places/la-tapberne"
      target="_blank"
      rel="noopener"
      aria-label="Find La Tap Berne on Misebox"
    >
      <img src="/img/ecosystem/wordmark-light.svg" alt="Misebox">
    </a>
  </LaTapBernePageSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaceFetch } from 'fireux-places/runtime/composables/fireux/firestore/place/usePlace'

const placeId = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0'
const { place, pending } = usePlaceFetch(placeId)

const text = (value: unknown) => String(value ?? '').trim()
const phone = computed(() => text(place.value?.phone))
const website = computed(() => text(place.value?.website))
const formattedAddress = computed(() =>
  text(place.value?.formatted_address) || 'Hauptstrasse 49, 3800 Matten bei Interlaken, Switzerland.'
)
const pageSubtitle = computed(() =>
  text(place.value?.short_address) || 'Address, phone, website, and map.'
)
const websiteLabel = computed(() =>
  website.value.replace(/^https?:\/\//, '').replace(/\/$/, '')
)

definePageMeta({
  layout: 'misebox-tenant',
})

useSeoMeta({
  title: 'La Tap Berne | Info',
  description: 'Contact, website, and map information for La Tap Berne.',
})
</script>

<style scoped>
.latap-info-misebox {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-self: center;
  margin-top: 0.25rem;
  color: var(--brand-canvas);
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.16em;
  text-decoration: none;
  text-transform: uppercase;
  opacity: 0.9;
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.latap-info-misebox:hover {
  opacity: 1;
  transform: translateY(-1px);
}

.latap-info-misebox img {
  display: block;
  width: auto;
  height: 1.35rem;
  filter: drop-shadow(0 0.2rem 1rem rgb(42 14 7 / 50%));
}
</style>
