<template>
  <div class="max-w-3xl space-y-8 py-12">
    <div class="space-y-2">
      <h1 class="text-4xl font-bold text-highlighted">Information</h1>
      <p class="text-muted">{{ pageSubtitle }}</p>
    </div>

    <UCard>
      <div class="space-y-3 text-toned">
        <p>{{ formattedAddress }}</p>
        <p v-if="phone">{{ phone }}</p>
        <UButton v-if="website" :to="website" target="_blank" color="neutral" variant="outline">
          {{ websiteLabel }}
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaceFetch } from 'fireux-places/runtime/composables/fireux/firestore/place/usePlace'
import { baerenRinggenbergContent } from '../config/content.config'

// Tenant content page spine: docs/concepts/family-tenant-global.md
const page = baerenRinggenbergContent.pages.info
const pageTitle = page.title
const placeId = baerenRinggenbergContent.brand.placeId
const { place } = usePlaceFetch(placeId)

const text = (value: unknown) => String(value ?? '').trim()
const phone = computed(() => text(place.value?.phone))
const website = computed(() => text(place.value?.website))
const formattedAddress = computed(() =>
  text(place.value?.formatted_address) || baerenRinggenbergContent.brand.address
)
const pageSubtitle = computed(() =>
  text(place.value?.short_address) || page.subtitleFallback
)
const websiteLabel = computed(() =>
  website.value.replace(/^https?:\/\//, '').replace(/\/$/, '')
)

definePageMeta({
  layout: 'default',
  nav: {
    key: 'info',
    label: 'Information',
    icon: 'i-lucide-info',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useSeoMeta({
  title: page.seoTitle,
  description: page.seoDescription,
})
</script>
