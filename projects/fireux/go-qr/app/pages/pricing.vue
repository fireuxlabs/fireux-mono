<template>
  <AppPricingPage description="Create your first QR doc free.">
    <section class="rounded-md border border-default bg-default p-5">
      <p class="fx-type-caption">Current MVP</p>
      <h2 class="mt-2 fx-type-section-title">One public doc, one QR code</h2>
      <p class="mt-3 fx-type-body">
        Upload one doc, choose a public path, and get a shareable QR page.
      </p>
      <p class="mt-3 fx-type-caption">
        More docs, private access, custom domains, and owner tools can come
        later. Today the product is intentionally simple.
      </p>
    </section>

    <template #actions>
      <UButton to="/" icon="i-lucide-qr-code" size="lg">
        Create your first QR doc free
      </UButton>
    </template>
  </AppPricingPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'pricing',
    label: 'Pricing',
    icon: 'i-lucide-badge-dollar-sign',
    order: 80,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Pricing - Go QR',
  ogTitle: 'Pricing - Go QR',
  twitterTitle: 'Pricing - Go QR',
  description:
    'Create your first QR doc free. Upload one public doc and get a QR code.',
  ogDescription:
    'Create your first QR doc free. Upload one public doc and get a QR code.',
  twitterDescription:
    'Create your first QR doc free. Upload one public doc and get a QR code.',
})
</script>
