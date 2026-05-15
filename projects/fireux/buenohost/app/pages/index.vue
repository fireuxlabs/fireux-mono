<template>
  <UPage>
    <UPageHeader
      title="Run smoother guest stays from one guide."
      description="Guest-ready pages help hosts share check-in, WiFi, house rules and local tips before guests ask."
    >
      <template #headline>
        <UBadge color="primary" variant="soft">
          Short-stay host tools
        </UBadge>
      </template>

      <template #links>
        <UButton to="/properties/alpine-view-apartment/guide" color="primary" icon="i-lucide-book-open">
          Open demo guide
        </UButton>
      </template>
    </UPageHeader>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'BuenoHost',
  description: 'Mobile guest guides and console-ready host information for holiday homes and short-stay properties.',
})
</script>
