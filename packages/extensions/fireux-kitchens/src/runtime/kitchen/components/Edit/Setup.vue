<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-list-checks" class="size-4 text-muted" />
          <div class="text-base font-semibold text-highlighted">
            Setup
          </div>
        </div>
      </template>

      <div class="space-y-3">
        <div
          v-for="item in setupItems"
          :key="item.key"
          class="flex items-center gap-3"
        >
          <div
            :class="[
              'grid size-7 shrink-0 place-items-center rounded-full border',
              item.ready
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-default bg-muted text-dimmed',
            ]"
          >
            <UIcon
              :name="item.ready ? 'i-lucide-check' : item.icon"
              class="size-3.5"
            />
          </div>
          <div class="min-w-0">
            <div class="text-sm font-medium text-highlighted">
              {{ item.label }}
            </div>
            <div class="truncate text-xs text-dimmed">
              {{ item.detail }}
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-if="hasLinkedPlace">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-map-pin" class="size-4 text-muted" />
          <div class="text-base font-semibold text-highlighted">
            Linked place
          </div>
        </div>
      </template>

      <div class="space-y-3">
        <p class="text-sm text-dimmed">
          Address, phone, website, and map details come from the venue place.
        </p>
        <UButton
          v-if="placeEditTo"
          size="xs"
          variant="soft"
          color="neutral"
          icon="i-lucide-map-pin"
          :to="placeEditTo"
        >
          Edit place details
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Kitchen } from '../../models/kitchen.model.ts'

const props = defineProps<{
  kitchen: Partial<Kitchen> | Record<string, unknown> | null
  placeEditTo: string
}>()

const clean = (value: unknown) => String(value ?? '').trim()
const source = computed(() => (props.kitchen || {}) as Record<string, any>)
const kitchenTitle = computed(() =>
  clean(source.value.display_name || source.value.name) || 'Kitchen'
)
const coverImage = computed(() => clean(source.value.cover_image))
const tagline = computed(() => clean(source.value.tagline))
const hasLinkedPlace = computed(() => Boolean(clean(source.value.place_id)))
const setupItems = computed(() => [
  {
    key: 'cover',
    label: 'Cover image',
    detail: coverImage.value ? 'Ready' : 'Add a kitchen cover',
    icon: 'i-lucide-image',
    ready: Boolean(coverImage.value),
  },
  {
    key: 'name',
    label: 'Kitchen name',
    detail: kitchenTitle.value,
    icon: 'i-lucide-store',
    ready: kitchenTitle.value !== 'Kitchen',
  },
  {
    key: 'tagline',
    label: 'Tagline',
    detail: tagline.value || 'Add a short public line',
    icon: 'i-lucide-quote',
    ready: Boolean(tagline.value),
  },
  {
    key: 'place',
    label: 'Venue facts',
    detail: hasLinkedPlace.value ? 'Linked place connected' : 'Link a place',
    icon: 'i-lucide-map-pinned',
    ready: hasLinkedPlace.value,
  },
])
</script>
