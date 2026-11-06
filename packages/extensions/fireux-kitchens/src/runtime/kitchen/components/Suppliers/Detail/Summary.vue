<template>
  <UCard v-if="supplier">
    <div class="flex flex-col gap-5 md:flex-row md:items-start">
      <div
        class="shrink-0 overflow-hidden rounded-lg border border-default bg-elevated/40"
        style="width: min(100%, 256px); aspect-ratio: 1"
        :style="{ backgroundColor: media.imageBackground }"
      >
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="title"
          class="size-full"
          :class="{ 'p-4': media.imageFit === 'contain' }"
          :style="{ objectFit: media.imageFit }"
          loading="lazy"
        />
        <div v-else class="flex h-full w-full items-center justify-center">
          <UIcon name="i-lucide-truck" />
        </div>
      </div>

      <div class="min-w-0 flex-1 space-y-5">
        <div class="fx-card-body-stack">
          <div class="flex items-center gap-2">
            <UChip :color="status ? 'success' : 'neutral'" inset />
            <h2>
              {{ title }}
            </h2>
          </div>

          <p v-if="headline">
            {{ headline }}
          </p>

          <p v-if="summary" class="max-w-2xl">
            {{ summary }}
          </p>
        </div>

        <div class="workspace-summary-grid">
          <div class="workspace-summary-field">
            Status:
            <span class="workspace-summary-value">{{
              status || 'Linked'
            }}</span>
          </div>
          <div class="workspace-summary-field">
            Categories:
            <span class="workspace-summary-value">{{ categories.length }}</span>
          </div>
          <div class="workspace-summary-field">
            Delivery areas:
            <span class="workspace-summary-value">{{
              deliveryAreas.length
            }}</span>
          </div>
          <div v-if="headquartersLabel" class="workspace-summary-field">
            Headquarters:
            <span class="workspace-summary-value">{{ headquartersLabel }}</span>
          </div>
        </div>

        <div v-if="categories.length" class="fx-card__chips">
          <UBadge
            v-for="category in categories"
            :key="category"
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ category }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { placeIdentityMedia } from 'fireux-places/runtime/place/utils/place-identity-media'

import type { SupplierSurface } from 'fireux-suppliers/runtime/supplier/composables/firestore/utils/view/useSupplierInterface'
type KitchenSupplierSurface = SupplierSurface

const props = defineProps<{
  supplier: KitchenSupplierSurface | null
}>()

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeStringArray = (value: unknown) =>
  Array.isArray(value) ? value.map(normalizeString).filter(Boolean) : []

const title = computed(
  () =>
    normalizeString(businessPlace.value?.short_name) ||
    normalizeString(businessPlace.value?.name) ||
    normalizeString(props.supplier?.id) ||
    'Untitled supplier'
)
const headline = computed(() => normalizeString(businessPlace.value?.tagline))
const summary = computed(() => normalizeString(businessPlace.value?.about))
const businessPlace = computed(() => {
  const value = props.supplier?.business_place
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null
})
const media = computed(() => placeIdentityMedia(props.supplier?.business_place))
const imageUrl = computed(() => media.value.imageUrl)
const headquartersLabel = computed(
  () =>
    normalizeString(businessPlace.value?.short_address) ||
    normalizeString(businessPlace.value?.name)
)
const status = computed(() => normalizeString(props.supplier?.identity?.status))
const categories = computed(() => [])
const deliveryAreas = computed(() =>
  normalizeStringArray(props.supplier?.delivery?.areas)
)
</script>
