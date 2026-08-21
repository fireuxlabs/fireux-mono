<template>
  <UPageCard variant="subtle">
    <div
      class="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-stretch"
    >
      <div class="space-y-3">
        <div class="aspect-video overflow-hidden rounded-lg bg-elevated">
          <img
            v-if="coverImage"
            :src="coverImage"
            :alt="`${kitchenTitle} cover image`"
            class="size-full object-cover"
          />
          <div
            v-else
            class="flex size-full flex-col items-center justify-center gap-2 text-dimmed"
          >
            <UIcon name="i-lucide-image-plus" class="size-8" />
            <span class="text-xs font-medium">1280 x 720 cover</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <UBadge :color="visibilityStatusColor" variant="soft">
            {{ visibilityStatusLabel }}
          </UBadge>
          <UBadge v-if="hasLinkedPlace" color="neutral" variant="soft">
            Place linked
          </UBadge>
          <UBadge :color="setupComplete ? 'success' : 'warning'" variant="soft">
            {{ completedSetupCount }} of {{ setupItems.length }} ready
          </UBadge>
        </div>
      </div>

      <div class="flex min-w-0 flex-col justify-between gap-5">
        <div class="space-y-4">
          <div class="space-y-2">
            <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
              Kitchen profile
            </p>
            <div class="flex items-start gap-3">
              <UAvatar
                :src="identityImage || undefined"
                :alt="kitchenTitle"
                :text="imageInitials"
                size="lg"
              />
              <div class="min-w-0">
                <h2 class="text-2xl font-semibold text-highlighted">
                  {{ kitchenTitle }}
                </h2>
                <p v-if="kitchenSubtitle" class="mt-1 text-sm text-dimmed">
                  {{ kitchenSubtitle }}
                </p>
              </div>
            </div>
          </div>

          <div class="grid gap-2 sm:grid-cols-2">
            <div
              v-for="item in profileFacts"
              :key="item.key"
              class="rounded-lg border border-default px-3 py-2"
            >
              <div
                class="flex items-center gap-2 text-xs font-medium text-dimmed"
              >
                <UIcon :name="item.icon" class="size-3.5" />
                <span>{{ item.label }}</span>
              </div>
              <div class="mt-1 truncate text-sm text-highlighted">
                {{ item.value }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton
            size="xs"
            variant="soft"
            color="neutral"
            icon="i-lucide-eye"
            :to="detailTo"
          >
            View public page
          </UButton>
          <UButton
            v-if="placeEditTo"
            size="xs"
            variant="soft"
            color="neutral"
            icon="i-lucide-map-pin"
            :to="placeEditTo"
          >
            Edit linked place
          </UButton>
          <UButton
            v-if="websiteTo"
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-lucide-external-link"
            :to="websiteTo"
            target="_blank"
          >
            Website
          </UButton>
        </div>
      </div>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Kitchen } from '../../models/kitchen.model.ts'

const props = defineProps<{
  kitchen: Partial<Kitchen> | Record<string, unknown> | null
  kitchenId: string
  detailTo: string
  placeEditTo: string
}>()

const clean = (value: unknown) => String(value ?? '').trim()
const source = computed(() => (props.kitchen || {}) as Record<string, any>)
const kitchenTitle = computed(
  () => clean(source.value.display_name || source.value.name) || 'Kitchen'
)
const kitchenSubtitle = computed(
  () => clean(source.value.tagline) || clean(source.value.short_address)
)
const coverImage = computed(() => clean(source.value.cover_image))
const identityImage = computed(() =>
  clean(
    source.value.display_image_url ||
      source.value.image_url ||
      source.value.identity?.image_url
  )
)
const address = computed(
  () =>
    clean(source.value.formatted_address) || clean(source.value.short_address)
)
const phone = computed(() => clean(source.value.phone))
const website = computed(() => clean(source.value.website))
const websiteTo = computed(() => {
  if (!website.value) return ''
  return /^https?:\/\//.test(website.value)
    ? website.value
    : `https://${website.value}`
})
const hasLinkedPlace = computed(() => Boolean(clean(source.value.place_id)))
const visibilityStatusLabel = computed(() =>
  source.value.visibility === true ? 'Visible' : 'Hidden'
)
const visibilityStatusColor = computed(() =>
  source.value.visibility === true ? 'success' : 'neutral'
)
const profileFacts = computed(
  () =>
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
            value: website.value.replace(/^https?:\/\//, '').replace(/\/$/, ''),
            icon: 'i-lucide-globe',
          }
        : null,
      props.kitchenId
        ? {
            key: 'id',
            label: 'Kitchen ID',
            value: props.kitchenId,
            icon: 'i-lucide-fingerprint',
          }
        : null,
    ].filter(Boolean) as Array<{
      key: string
      label: string
      value: string
      icon: string
    }>
)
const setupItems = computed(() => [
  { ready: Boolean(coverImage.value) },
  { ready: kitchenTitle.value !== 'Kitchen' },
  { ready: Boolean(clean(source.value.tagline)) },
  { ready: hasLinkedPlace.value },
])
const completedSetupCount = computed(
  () => setupItems.value.filter((item) => item.ready).length
)
const setupComplete = computed(
  () => completedSetupCount.value === setupItems.value.length
)
const imageInitials = computed(() => {
  const parts = kitchenTitle.value.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'K'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
})
</script>
