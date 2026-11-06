<template>
  <div class="space-y-8 py-12">
    <div class="pagebody">
      <h1 class="fx-type-page-title">{{ pageTitle }}</h1>
      <p class="fx-type-body">{{ pageSubtitle }}</p>
    </div>

    <UCard>
      <iframe
        v-if="mapRequested"
        title="Map to Hotel Bären Ringgenberg"
        :src="baerenRinggenbergContent.links.googleMapEmbed"
        class="block aspect-video w-full border-0"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      />
      <div
        v-else
        class="grid aspect-video place-content-center justify-items-center gap-4 p-8"
      >
        <p class="fx-type-body">
          Google Maps loads only when you ask to view it.
        </p>
        <UButton
          icon="i-lucide-map"
          label="Load Google Maps"
          @click="mapRequested = true"
        />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { baerenRinggenbergContent } from '../config/content.config'

const mapRequested = ref(false)

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
