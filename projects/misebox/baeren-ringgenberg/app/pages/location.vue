<template>
  <div class="space-y-8 py-12">
    <div class="space-y-2">
      <h1 class="text-4xl font-bold text-highlighted">{{ pageTitle }}</h1>
      <p class="text-muted">{{ pageSubtitle }}</p>
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
      <iframe
        title="Map to Hotel Bären Ringgenberg"
        :src="baerenRinggenbergContent.links.googleMapEmbed"
        class="block aspect-video w-full border-0"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../config/content.config'

// Tenant content page spine: docs/concepts/family-tenant-global.md
const page = baerenRinggenbergContent.pages.location
const pageTitle = page.title
const pageSubtitle = baerenRinggenbergContent.brand.address

definePageMeta({
  layout: 'default',
  nav: {
    key: 'location',
    label: 'Location',
    icon: 'i-lucide-map-pin',
    order: 55,
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
