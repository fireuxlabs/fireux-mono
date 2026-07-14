<template>
  <BaerenRinggenbergPage>
    <BaerenRinggenbergHero
      :title="pageTitle"
      :subtitle="pageSubtitle"
    >
      <BaerenRinggenbergCopy>
        <p>{{ formattedAddress }}</p>
        <p v-if="phone">Call {{ phone }}</p>
        <p v-if="website">{{ websiteLabel }}</p>
      </BaerenRinggenbergCopy>

      <BaerenRinggenbergMiseboxLink />
    </BaerenRinggenbergHero>
  </BaerenRinggenbergPage>
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
  layout: 'baeren-default',
})

useSeoMeta({
  title: page.seoTitle,
  description: page.seoDescription,
})
</script>
