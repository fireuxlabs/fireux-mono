<template>
  <section
    v-if="hasSurface"
    class="kitchen-identity"
  >
    <PublicEntityHero
      :title="title"
      eyebrow="Kitchen"
      :cover-url="heroImage"
      cover-alt=""
      :image-url="logoImage"
      image-alt=""
      image-fit="contain"
      :media-background="mediaBackdropColor"
      :initials="logoInitials"
      :description="subtitle"
      :summary="about"
      :location="address"
    >
      <template
        v-if="actions.length"
        #actions
      >
        <UButton
          v-for="action in actions"
          :key="action.key"
          :to="action.to"
          :target="action.target"
          :rel="action.target ? 'noopener noreferrer' : undefined"
          size="md"
          :color="action.key === 'phone' ? 'primary' : 'neutral'"
          :variant="action.key === 'phone' ? 'solid' : 'soft'"
          :icon="action.icon"
        >
          {{ action.label }}
        </UButton>
      </template>
    </PublicEntityHero>

    <div
      v-if="foodGallery.length"
      class="kitchen-identity__gallery"
      aria-label="Kitchen gallery"
    >
      <img
        v-for="image in foodGallery"
        :key="image"
        :src="image"
        :alt="imageAlt"
        loading="lazy"
        decoding="async"
      >
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = defineProps<{
  kitchen: KitchenSurface | null
}>()

const clean = (value: unknown) => String(value ?? '').trim()
const raw = computed(() => (props.kitchen || {}) as Record<string, any>)
const identityRecord = computed(() =>
  raw.value.identity && typeof raw.value.identity === 'object'
    ? raw.value.identity as Record<string, unknown>
    : {}
)
const titleRaw = computed(() => clean(raw.value.display_name || raw.value.name))
const title = computed(() =>
  titleRaw.value || 'Kitchen'
)
const shortAddress = computed(() => clean(raw.value.short_address))
const address = computed(() =>
  clean(raw.value.formatted_address) || shortAddress.value
)
const subtitle = computed(() =>
  clean(raw.value.tagline || raw.value.brand_tagline) || shortAddress.value
)
const about = computed(() => clean(raw.value.about))
const heroImage = computed(() => clean(raw.value.cover_image))
const logoImage = computed(() =>
  clean(identityRecord.value.logo_image_url) ||
  clean(raw.value.logo_image_url)
)
const mediaBackdropColor = computed(() =>
  clean(
    identityRecord.value.media_backdrop_color ||
    raw.value.media_backdrop_color
  )
)
const foodGallery = computed(() => {
  const gallery = Array.isArray(raw.value.food_gallery)
    ? raw.value.food_gallery
    : Array.isArray(raw.value.gallery_images)
      ? raw.value.gallery_images
      : []

  return gallery.map(clean).filter(Boolean)
})
const imageAlt = computed(() =>
  title.value ? `${title.value} food image` : 'Kitchen food image'
)
const logoInitials = computed(() => {
  const parts = title.value.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'K'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
})
const phone = computed(() => clean(raw.value.phone))
const website = computed(() => clean(raw.value.website))
const mapUrl = computed(() => clean(raw.value.google_maps_url))
const actions = computed(() =>
  [
    phone.value
      ? {
          key: 'phone',
          label: 'Call',
          icon: 'i-lucide-phone',
          to: `tel:${phone.value}`,
        }
      : null,
    website.value
      ? {
          key: 'website',
          label: 'Website',
          icon: 'i-lucide-globe',
          to: website.value,
          target: '_blank',
        }
      : null,
    mapUrl.value
      ? {
          key: 'map',
          label: 'Directions',
          icon: 'i-lucide-navigation',
          to: mapUrl.value,
          target: '_blank',
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string
    label: string
    icon: string
    to: string
    target?: string
  }>
)
const hasSurface = computed(() =>
  Boolean(
    titleRaw.value ||
      heroImage.value ||
      about.value ||
      address.value ||
      phone.value ||
      website.value ||
      mapUrl.value
  )
)
</script>

<style scoped>
.kitchen-identity {
  display: grid;
  gap: calc(var(--spacing) * 6);
}

.kitchen-identity__gallery {
  display: grid;
  gap: calc(var(--spacing) * 3);
  grid-auto-columns: minmax(calc(var(--spacing) * 44), 76%);
  grid-auto-flow: column;
  overscroll-behavior-inline: contain;
  padding-bottom: var(--spacing);
  overflow-x: auto;
  scroll-snap-type: inline mandatory;
}

.kitchen-identity__gallery img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  object-fit: cover;
  scroll-snap-align: start;
}

@media (min-width: 40rem) {
  .kitchen-identity__gallery {
    grid-auto-columns: auto;
    grid-auto-flow: row;
    grid-template-columns: repeat(auto-fit, minmax(calc(var(--spacing) * 48), 1fr));
    overflow-x: visible;
    padding-bottom: 0;
    scroll-snap-type: none;
  }
}
</style>
