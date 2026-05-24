<template>
  <PublicSimplePage
    title="Get Started"
    description="Create a public QR doc in one pass."
    back-label="Go QR"
  >
    <section class="space-y-4">
      <ol class="list-decimal space-y-2 pl-5 text-muted">
        <li>Upload a public doc.</li>
        <li>Choose its public path.</li>
        <li>Create the QR page.</li>
      </ol>

      <p class="text-sm text-muted">
        QR docs are public. Do not upload private, sensitive, or confidential information.
      </p>
    </section>

    <template #actions>
      <UButton
        to="/"
        icon="i-lucide-qr-code"
        size="lg"
      >
        Create your first QR doc
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'get-started',
    label: 'Get Started',
    icon: 'i-lucide-rocket',
    order: 10,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Get Started - Go QR',
  ogTitle: 'Get Started - Go QR',
  twitterTitle: 'Get Started - Go QR',
  description: 'Create a public QR doc with Go QR: upload a doc, choose a public path, and create the QR page.',
  ogDescription: 'Create a public QR doc with Go QR: upload a doc, choose a public path, and create the QR page.',
  twitterDescription: 'Create a public QR doc with Go QR: upload a doc, choose a public path, and create the QR page.',
})
</script>
