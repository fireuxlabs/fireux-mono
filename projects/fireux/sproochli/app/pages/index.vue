<template>
  <UPage>
    <UPageHeader
      title="Make QR information easy in every language."
      description="Simple public pages help guests read instructions, menus and local notes from one QR link."
    >
      <template #headline>
        <UBadge color="primary" variant="soft">
          Multilingual QR pages
        </UBadge>
      </template>

      <template #links>
        <UButton to="/bnb/holiday-with-nats" color="primary" icon="i-lucide-house">
          Open guest guide
        </UButton>
        <UButton to="/info/bern-bike-rental/rental-instructions" variant="soft" icon="i-lucide-info">
          View info page
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
  title: 'Sproochli',
  description: 'Simple public pages for BNB guides, information pages, and read-only menus.',
})
</script>
