<template>
  <UCard v-if="supplier">
    <div class="flex flex-col gap-5 md:flex-row md:items-start">
      <div
        class="shrink-0 overflow-hidden rounded-lg border border-default bg-elevated/40"
        style="width: 256px; height: 256px; max-width: 256px; max-height: 256px"
      >
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="title"
          class="object-cover"
          style="
            width: 256px;
            height: 256px;
            max-width: 256px;
            max-height: 256px;
          "
          loading="lazy"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center text-dimmed"
        >
          <UIcon name="i-lucide-truck" class="size-8" />
        </div>
      </div>

      <div class="min-w-0 flex-1 space-y-5">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <UChip :color="status ? 'success' : 'neutral'" inset />
            <h2 class="text-2xl font-semibold text-highlighted">
              {{ title }}
            </h2>
          </div>

          <p v-if="headline" class="text-sm text-toned">
            {{ headline }}
          </p>

          <p v-if="summary" class="max-w-2xl text-sm text-dimmed">
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

        <div v-if="categories.length" class="flex flex-wrap items-center gap-1">
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
    normalizeString(companyPlace.value?.short_name) ||
    normalizeString(companyPlace.value?.name) ||
    normalizeString(props.supplier?.id) ||
    'Untitled supplier'
)
const headline = computed(() => normalizeString(companyPlace.value?.tagline))
const summary = computed(() => normalizeString(companyPlace.value?.about))
const companyPlace = computed(() => {
  const value = props.supplier?.company_place
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null
})
const imageUrl = computed(
  () =>
    normalizeString(companyPlace.value?.image_url) ||
    normalizeString(companyPlace.value?.logo_image)
)
const headquartersLabel = computed(
  () =>
    normalizeString(companyPlace.value?.short_address) ||
    normalizeString(companyPlace.value?.name)
)
const status = computed(() => normalizeString(props.supplier?.identity?.status))
const categories = computed(() => [])
const deliveryAreas = computed(() =>
  normalizeStringArray(props.supplier?.delivery?.areas)
)
</script>
