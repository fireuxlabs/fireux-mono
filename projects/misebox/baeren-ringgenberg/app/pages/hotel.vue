<template>
  <UPage>
    <UPageHeader :title="page.title" :description="page.subtitle">
      <template #links>
        <UButton
          :to="baerenRinggenbergContent.links.booking"
          target="_blank"
          label="Book a room"
          icon="i-lucide-calendar-check"
        />
        <UButton
          to="/about#contact"
          label="Contact the hotel"
          color="neutral"
          variant="outline"
        />
      </template>
    </UPageHeader>

    <UPageBody class="space-y-8">
      <div class="grid gap-4 md:grid-cols-3">
        <UPageCard title="37 guest rooms" description="Rooms for solo travellers, couples, families and groups." icon="i-lucide-bed-double" />
        <UPageCard title="1–8 guests" description="Room options range from compact stays to larger group rooms." icon="i-lucide-users" />
        <UPageCard title="Well connected" description="Around 10 minutes from Lake Brienz and 3 km from Interlaken." icon="i-lucide-map-pin" />
      </div>

      <UCard>
        <div class="max-w-3xl space-y-3 text-toned">
          <h2 class="text-xl font-semibold text-highlighted">A base for the Bernese Oberland</h2>
          <p>
            The chalet-style Hotel Bären stands in the centre of Ringgenberg, with walking and cycling routes close by.
          </p>
          <p>
            Guest rooms include a shower, toilet, washbasin and television. The restaurant, bar and event spaces are in the same building.
          </p>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../config/content.config'

const page = baerenRinggenbergContent.pages.hotel

definePageMeta({
  layout: 'default',
  nav: {
    key: 'hotel',
    label: 'Hotel',
    icon: 'i-lucide-bed-double',
    order: 10,
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
