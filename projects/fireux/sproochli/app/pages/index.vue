<template>
  <UPage>
    <UPageHeader
      title="Translation pages for real visitor information."
      description="Create QR-ready pages for guest instructions, menus, signs, notices, and local guides."
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
  description: 'QR-ready translation pages for guest instructions, menus, signs, notices, and local guides.',
})
</script>
