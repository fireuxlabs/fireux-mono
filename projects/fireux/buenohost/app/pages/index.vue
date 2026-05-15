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
        <UButton to="/bnb/alpine-view-demo" color="primary" icon="i-lucide-house">
          Open demo guide
        </UButton>
        <UButton to="/properties/alpine-view-apartment" variant="soft" icon="i-lucide-message-circle">
          Message the host
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
  description: 'Mobile guest guides and console-ready host information for holiday homes and BNBs.',
})
</script>
