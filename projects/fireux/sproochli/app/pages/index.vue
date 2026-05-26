<template>
  <UPage>
    <UPageHeader
      title="Publish simple visitor information in every language."
      description="Create QR-ready pages for instructions, menus and local notes."
    >
      <template #headline>
        <UBadge color="primary" variant="soft">
          QR information pages
        </UBadge>
      </template>

      <template #links>
        <UButton
          to="/info/bern-bike-rental/rental-instructions"
          color="primary"
          icon="i-lucide-info"
        >
          View info page
        </UButton>
        <UButton to="/menus" variant="soft" icon="i-lucide-book-open">
          View menus
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <LandingSolutions variant="preview" />
    </UPageBody>
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
