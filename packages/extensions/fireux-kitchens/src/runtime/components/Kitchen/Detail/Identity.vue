<template>
  <UPageCard v-if="hasSurface" variant="subtle">
    <div
      :class="[
        'grid gap-4',
        heroImage
          ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]'
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
        <div class="space-y-3">
          <div class="flex flex-wrap gap-2">
            <UBadge color="primary" variant="soft">
              Kitchen
            </UBadge>
            <UBadge v-if="claimedBy" color="success" variant="soft">
              Claimed
            </UBadge>
            <UBadge v-if="isDraft" color="neutral" variant="soft">
              Draft
            </UBadge>
          </div>

          <div class="space-y-2">
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

        <div v-if="detailItems.length" class="grid gap-2 sm:grid-cols-2">
          <div
            v-for="item in detailItems"
            :key="item.key"
            class="rounded-lg border border-default bg-default px-3 py-2"
          >
            <div class="flex items-center gap-2 text-xs font-medium text-dimmed">
              <UIcon :name="item.icon" class="size-3.5" />
              <span>{{ item.label }}</span>
            </div>
            <div class="mt-1 truncate text-sm text-highlighted">
              {{ item.value }}
            </div>
          </div>
        </div>

        <div v-if="typeChips.length" class="flex flex-wrap gap-2">
          <UBadge
            v-for="chip in typeChips"
            :key="chip"
            color="neutral"
            variant="soft"
          >
            {{ chip }}
          </UBadge>
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
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = defineProps<{
  kitchen: KitchenSurface | null
}>()

const clean = (value: unknown) => String(value ?? '').trim()
const raw = computed(() => (props.kitchen || {}) as Record<string, any>)
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
const phone = computed(() => clean(raw.value.phone))
const website = computed(() => clean(raw.value.website))
const mapUrl = computed(() => clean(raw.value.google_maps_url))
const claimedBy = computed(() => clean(raw.value.claimed_by))
const isDraft = computed(() => raw.value.show === false)
const websiteLabel = computed(() =>
  website.value.replace(/^https?:\/\//, '').replace(/\/$/, '')
)
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
const detailItems = computed(() =>
  [
    address.value
      ? {
          key: 'address',
          label: 'Address',
          value: address.value,
          icon: 'i-lucide-map-pin',
        }
      : null,
    phone.value
      ? {
          key: 'phone',
          label: 'Phone',
          value: phone.value,
          icon: 'i-lucide-phone',
        }
      : null,
    website.value
      ? {
          key: 'website',
          label: 'Website',
          value: websiteLabel.value,
          icon: 'i-lucide-globe',
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string
    label: string
    value: string
    icon: string
  }>
)
const typeChips = computed(() => {
  const generic = new Set(['establishment', 'point_of_interest'])
  const types = Array.isArray(raw.value.types) ? raw.value.types : []
  const tags = Array.isArray(raw.value.tags) ? raw.value.tags : []

  return [...types, ...tags]
    .map(clean)
    .filter((item) => item && !generic.has(item))
    .map((item) =>
      item
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    )
    .slice(0, 5)
})
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
