<template>
  <section v-if="hasSurface" class="space-y-4">
    <div
      :class="[
        'grid gap-4',
        heroImage
          ? 'lg:grid-cols-[minmax(0,0.575fr)_minmax(18rem,1fr)]'
          : '',
      ]"
    >
      <div
        v-if="heroImage"
        class="aspect-video overflow-hidden rounded-lg bg-elevated"
      >
        <img
          :src="heroImage"
          :alt="imageAlt"
          class="size-full object-cover"
        >
      </div>

      <div class="flex min-w-0 flex-col justify-between gap-5">
        <div>
          <div class="flex items-start gap-3">
            <UAvatar
              v-if="logoImage"
              :src="logoImage"
              :alt="logoAlt"
              :text="logoInitials"
              size="xl"
              :class="logoShadeClass"
              class="mt-0.5 shrink-0"
            />

            <div class="min-w-0 space-y-2">
              <h2 class="text-2xl font-semibold text-highlighted">
                {{ title }}
              </h2>
              <p v-if="subtitle" class="text-sm text-dimmed">
                {{ subtitle }}
              </p>
              <p v-if="address" class="flex gap-2 text-sm text-muted">
                <UIcon name="i-lucide-map-pin" class="mt-0.5 size-4 shrink-0" />
                <span>{{ address }}</span>
              </p>
            </div>
          </div>
        </div>

        <div v-if="actions.length" class="flex flex-wrap gap-2">
          <UButton
            v-for="action in actions"
            :key="action.key"
            :to="action.to"
            :target="action.target"
            size="sm"
            color="neutral"
            variant="soft"
            :icon="action.icon"
          >
            {{ action.label }}
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="foodGallery.length" class="mt-4 flex gap-2 overflow-x-auto pb-1">
      <img
        v-for="image in foodGallery"
        :key="image"
        :src="image"
        :alt="imageAlt"
        class="size-24 shrink-0 rounded-lg object-cover"
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
const heroImage = computed(() =>
  clean(raw.value.cover_image)
)
const logoImage = computed(() =>
  clean(identityRecord.value.image_url) ||
  clean(raw.value.display_image_url) ||
  clean(raw.value.image_url)
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
const logoAlt = computed(() =>
  title.value ? `${title.value} logo` : 'Kitchen logo'
)
const logoInitials = computed(() => {
  const parts = title.value.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'K'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
})
const logoShadeClass = computed(() => {
  const shade = clean(identityRecord.value.image_shade || raw.value.image_shade)
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
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
      address.value ||
      phone.value ||
      website.value ||
      mapUrl.value
  )
)
</script>
