<template>
  <main class="min-h-screen bg-default text-default" data-entity-cta-family="utility-managed">
    <UContainer class="py-8 sm:py-10">
      <header class="mx-auto mb-6 max-w-xl space-y-3">
        <h1 class="text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
          Go QR
        </h1>
        <p class="text-base text-muted sm:text-lg">
          Create scannable public links for text, docs, forms, contact actions, and more.
        </p>
      </header>

      <ClientOnly>
        <GoQrToolsDoc class="mx-auto max-w-xl" />
      </ClientOnly>

      <LandingSolutions
        variant="preview"
        :limit="99"
        title="What do you need a QR code for?"
        subtitle="Pick the thing people should open, save, join, or contact after they scan."
        always-show-more-button
      />
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Go QR - Scannable public links',
  ogTitle: 'Go QR - Scannable public links',
  twitterTitle: 'Go QR - Scannable public links',
  description: 'Create scannable public links for text, docs, forms, contact actions, and more.',
  ogDescription: 'Create scannable public links for text, docs, forms, contact actions, and more.',
  twitterDescription: 'Create scannable public links for text, docs, forms, contact actions, and more.',
})
</script>
