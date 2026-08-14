<template>
  <section v-if="hasSurface" class="kitchen-header">
    <header
      class="kitchen-header__identity"
      :class="{ 'kitchen-header__identity--covered': hasCover }"
      data-kitchen-header
    >
      <figure v-if="hasCover" class="kitchen-header__cover">
        <div class="kitchen-header__cover-fallback" aria-hidden="true">
          <UIcon name="i-lucide-image" />
        </div>
        <img
          v-if="!coverFailed"
          :src="heroImage"
          alt=""
          loading="eager"
          decoding="async"
          fetchpriority="high"
          @error="coverFailed = true"
        />
      </figure>

      <div
        class="kitchen-header__sheet"
        :class="{ 'kitchen-header__sheet--has-actions': actions.length }"
      >
        <div class="kitchen-header__image" :style="imageStyle">
          <span v-if="!logoImage || imageFailed" aria-hidden="true">
            {{ logoInitials }}
          </span>
          <img
            v-if="logoImage && !imageFailed"
            :src="logoImage"
            alt=""
            :loading="hasCover ? 'lazy' : 'eager'"
            decoding="async"
            @error="imageFailed = true"
          />
        </div>

        <div class="kitchen-header__copy">
          <p class="kitchen-header__eyebrow fx-type-label">Kitchen</p>
          <h1 class="kitchen-header__title fx-type-display-title">
            {{ title }}
          </h1>
          <p
            v-if="subtitle"
            class="kitchen-header__description fx-type-description"
          >
            {{ subtitle }}
          </p>
          <p v-if="address" class="kitchen-header__location">
            <UIcon name="i-lucide-map-pin" aria-hidden="true" />
            <span>{{ address }}</span>
          </p>
        </div>

        <div v-if="actions.length" class="kitchen-header__actions">
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
        </div>
      </div>
    </header>

    <div
      v-if="foodGallery.length"
      class="kitchen-header__gallery"
      aria-label="Kitchen gallery"
    >
      <img
        v-for="image in foodGallery"
        :key="image"
        :src="image"
        :alt="imageAlt"
        loading="lazy"
        decoding="async"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { KitchenSurface } from '../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

defineOptions({ name: 'KitchenHeader' })

const props = defineProps<{
  kitchen: KitchenSurface | null
}>()

const coverFailed = ref(false)
const imageFailed = ref(false)
const clean = (value: unknown) => String(value ?? '').trim()
const raw = computed(() => (props.kitchen || {}) as Record<string, any>)
const identityRecord = computed(() =>
  raw.value.identity && typeof raw.value.identity === 'object'
    ? (raw.value.identity as Record<string, unknown>)
    : {}
)
const titleRaw = computed(() => clean(raw.value.display_name || raw.value.name))
const title = computed(() => titleRaw.value || 'Kitchen')
const shortAddress = computed(() => clean(raw.value.short_address))
const address = computed(
  () => clean(raw.value.formatted_address) || shortAddress.value
)
const subtitle = computed(
  () =>
    clean(raw.value.tagline || raw.value.brand_tagline) || shortAddress.value
)
const heroImage = computed(() => clean(raw.value.cover_image))
const hasCover = computed(() => Boolean(heroImage.value))
const logoImage = computed(
  () =>
    clean(identityRecord.value.logo_image_url) ||
    clean(raw.value.logo_image_url)
)
const mediaBackdropColor = computed(() =>
  clean(
    identityRecord.value.media_backdrop_color || raw.value.media_backdrop_color
  )
)
const imageStyle = computed(() =>
  mediaBackdropColor.value
    ? { '--fx-kitchen-header-media-bg': mediaBackdropColor.value }
    : undefined
)
const foodGallery = computed(() => {
  const gallery = Array.isArray(raw.value.food_gallery)
    ? raw.value.food_gallery
    : Array.isArray(raw.value.gallery_images)
      ? raw.value.gallery_images
      : []
  return gallery.map(clean).filter(Boolean)
})
const imageAlt = computed(() => `${title.value} food image`)
const logoInitials = computed(() => {
  const parts = title.value.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'K'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
})
const phone = computed(() => clean(raw.value.phone))
const website = computed(() => clean(raw.value.website))
const mapUrl = computed(() => clean(raw.value.google_maps_url))
const actions = computed(
  () =>
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
      address.value ||
      phone.value ||
      website.value ||
      mapUrl.value
  )
)

watch(heroImage, () => {
  coverFailed.value = false
})
watch(logoImage, () => {
  imageFailed.value = false
})
</script>

<style scoped src="./header.css"></style>
